/**
 * PharmaSearch — Source-to-JSON Pipeline Implementation
 * 
 * Extracts, normalizes, cross-references, and validates all 9,595 records from:
 * clean_NOMENCLATURE.VERSION.AOUT_.2026- (1).xlsx
 * 
 * Produces: public/data/nomenclature.json
 */

import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import type {
  PharmaceuticalRecord,
  DatasetMetadata,
  NomenclatureDataset,
  SourceListType,
  ProductClassification,
  ManufacturingOrigin,
  PrescriptionSchedule,
  ListDiscrepancy,
} from '../src/types/pharmaceutical';
import { parseSourceDate } from '../src/utils/date';

export interface PipelineConfig {
  sourceWorkbookPath: string;
  outputJsonPath: string;
  snapshotDate: string;
  expectedCounts: {
    nomenclatureActive: number;
    nonRenouveles: number;
    retraits: number;
    totalRows: number;
  };
}

export const DEFAULT_PIPELINE_CONFIG: PipelineConfig = {
  sourceWorkbookPath: path.resolve(import.meta.dirname, '../clean_NOMENCLATURE.VERSION.AOUT_.2026- (1).xlsx'),
  outputJsonPath: path.resolve(import.meta.dirname, '../public/data/nomenclature.json'),
  snapshotDate: '2026-08-31',
  expectedCounts: {
    nomenclatureActive: 5425,
    nonRenouveles: 1491,
    retraits: 2679,
    totalRows: 9595,
  },
};

/**
 * Normalizes strings for robust matching (removes accents, punctuation, extra whitespace).
 */
export function normalizeForMatch(s: string | undefined | null): string {
  if (!s) return '';
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Resolves Excel cell value to raw trimmed string.
 */
function getCellRawString(cell: ExcelJS.Cell): string {
  if (cell.value === undefined || cell.value === null) return '';
  if (cell.value instanceof Date) {
    if (isNaN(cell.value.getTime())) return 'Invalid Date';
    const y = cell.value.getUTCFullYear();
    const m = String(cell.value.getUTCMonth() + 1).padStart(2, '0');
    const d = String(cell.value.getUTCDate()).padStart(2, '0');
    return `${d}/${m}/${y}`;
  }
  if (typeof cell.value === 'object') {
    // Rich text or formula result
    const obj = cell.value as unknown as Record<string, unknown>;
    if ('text' in obj && typeof obj.text === 'string') return obj.text.trim();
    if ('result' in obj && obj.result !== undefined && obj.result !== null) {
      return String(obj.result).trim();
    }
  }
  return String(cell.value).trim();
}

/**
 * Normalizes header string to map column fields reliably regardless of spacing or punctuation.
 */
function normalizeHeaderName(h: string): string {
  return h
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .trim();
}

interface ColumnMap {
  [key: string]: number; // fieldName -> colNumber
}

function resolveHeaderColumns(ws: ExcelJS.Worksheet, headerRowNumber: number): ColumnMap {
  const row = ws.getRow(headerRowNumber);
  const map: ColumnMap = {};

  row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    const rawHeader = String(cell.value || '').trim();
    const norm = normalizeHeaderName(rawHeader);

    if (norm === 'N' || norm === 'NUM' || norm === 'NO') map['rowNum'] = colNumber;
    else if (norm.includes('PAYS')) map['country'] = colNumber;
    else if (norm.includes('LABORATOIRE')) map['laboratory'] = colNumber;
    else if (norm.includes('DATE') && norm.includes('INITIAL')) map['initialRegistrationDate'] = colNumber;
    else if (norm.includes('DATE') && norm.includes('FINAL')) map['finalRegistrationDate'] = colNumber;
    else if (norm.includes('DATE') && norm.includes('RETRAIT')) map['withdrawalDate'] = colNumber;
    else if (norm.includes('MOTIF') && norm.includes('RETRAIT')) map['withdrawalReason'] = colNumber;
    else if (norm.includes('ENREGISTREMENT')) map['registrationNumber'] = colNumber;
    else if (norm === 'CODE') map['code'] = colNumber;
    else if (norm.includes('DENOMINATION') || norm.includes('DCI')) map['dci'] = colNumber;
    else if (norm.includes('MARQUE') || norm.includes('SPECIALITE')) map['brandName'] = colNumber;
    else if (norm === 'FORME') map['form'] = colNumber;
    else if (norm === 'DOSAGE') map['dosage'] = colNumber;
    else if (norm.includes('CONDITIONNEMENT')) map['packaging'] = colNumber;
    else if (norm === 'LISTE') map['prescriptionSchedule'] = colNumber;
    else if (norm === 'P1') map['p1'] = colNumber;
    else if (norm === 'P2') map['p2'] = colNumber;
    else if (norm === 'OBS' || norm === 'OBSERVATION' || norm === 'OBSERVATIONS') map['observations'] = colNumber;
    else if (norm === 'TYPE') map['productClassification'] = colNumber;
    else if (norm === 'STATUT') map['manufacturingOrigin'] = colNumber;
    else if (norm.includes('STABILITE') || norm.includes('DUREE')) map['shelfLife'] = colNumber;
  });

  return map;
}

export async function processWorkbook(config: PipelineConfig = DEFAULT_PIPELINE_CONFIG): Promise<NomenclatureDataset> {
  const startTime = Date.now();
  console.log(`[PharmaSearch Pipeline] Reading workbook: ${config.sourceWorkbookPath}`);

  if (!fs.existsSync(config.sourceWorkbookPath)) {
    throw new Error(`Source workbook not found at path: ${config.sourceWorkbookPath}`);
  }

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(config.sourceWorkbookPath);

  const sheetConfigs: Array<{
    sheetName: string;
    listType: SourceListType;
    idPrefix: string;
    headerRow: number;
    expectedCount: number;
  }> = [
    {
      sheetName: 'Nomenclature Aout 2026',
      listType: 'NOMENCLATURE_ACTIVE',
      idPrefix: 'NOM',
      headerRow: 16,
      expectedCount: config.expectedCounts.nomenclatureActive,
    },
    {
      sheetName: 'Non Renouvelés ',
      listType: 'NON_RENOUVELE',
      idPrefix: 'NON',
      headerRow: 12,
      expectedCount: config.expectedCounts.nonRenouveles,
    },
    {
      sheetName: 'Retraits',
      listType: 'RETRAIT',
      idPrefix: 'RET',
      headerRow: 11,
      expectedCount: config.expectedCounts.retraits,
    },
  ];

  const allRecords: PharmaceuticalRecord[] = [];
  const listCounts = {
    nomenclatureActive: 0,
    nonRenouveles: 0,
    retraits: 0,
  };

  let ambiguousDateCount = 0;
  let missingCriticalCount = 0;

  for (const sheetCfg of sheetConfigs) {
    const ws = wb.getWorksheet(sheetCfg.sheetName);
    if (!ws) {
      throw new Error(`Worksheet "${sheetCfg.sheetName}" not found in workbook!`);
    }

    const colMap = resolveHeaderColumns(ws, sheetCfg.headerRow);
    console.log(`[Worksheet: "${sheetCfg.sheetName}"] Header Row: ${sheetCfg.headerRow}, Mapped Columns: ${Object.keys(colMap).length}`);

    let sheetRecordCount = 0;
    const startRow = sheetCfg.headerRow + 1;
    const endRow = ws.rowCount;

    for (let rowNumber = startRow; rowNumber <= endRow; rowNumber++) {
      const row = ws.getRow(rowNumber);
      
      // Collect raw values for provenance
      const originalFieldValues: Record<string, string> = {};
      row.eachCell({ includeEmpty: false }, (cell) => {
        originalFieldValues[cell.address.replace(/[0-9]/g, '')] = getCellRawString(cell);
      });

      // Extract fields according to header map
      const getVal = (field: string): string => {
        const colNum = colMap[field];
        if (!colNum) return '';
        const cell = row.getCell(colNum);
        return getCellRawString(cell);
      };

      const getRawOrDate = (field: string) => {
        const colNum = colMap[field];
        if (!colNum) return undefined;
        const cell = row.getCell(colNum);
        return cell.value;
      };

      const registrationNumber = getVal('registrationNumber');
      const code = getVal('code');
      const dci = getVal('dci');
      const brandName = getVal('brandName');
      const form = getVal('form');
      const dosage = getVal('dosage');
      const packaging = getVal('packaging');
      const rawSchedule = getVal('prescriptionSchedule');
      const p1Raw = getVal('p1').toUpperCase();
      const p2Raw = getVal('p2').toUpperCase();
      const lab = getVal('laboratory');
      const country = getVal('country');
      const rawType = getVal('productClassification').toUpperCase();
      const rawStatut = getVal('manufacturingOrigin').toUpperCase();
      const shelfLife = getVal('shelfLife') || undefined;
      const observations = getVal('observations') || undefined;
      const withdrawalReason = getVal('withdrawalReason') || undefined;

      // Track missing critical values (form, dosage, packaging)
      if (!brandName || !dci || !registrationNumber || !form || !dosage) {
        missingCriticalCount++;
      }

      // Date parsing
      const initialDate = parseSourceDate(getRawOrDate('initialRegistrationDate') as string | number | Date);
      if (initialDate.isInvalidDate) ambiguousDateCount++;

      let finalDate = undefined;
      if (colMap['finalRegistrationDate']) {
        finalDate = parseSourceDate(getRawOrDate('finalRegistrationDate') as string | number | Date);
        if (finalDate.isInvalidDate) ambiguousDateCount++;
      }

      let withdrawalDate = undefined;
      if (colMap['withdrawalDate']) {
        withdrawalDate = parseSourceDate(getRawOrDate('withdrawalDate') as string | number | Date);
        if (withdrawalDate.isInvalidDate) ambiguousDateCount++;
      }

      // Prescription schedule (NEVER infer OTC from blank)
      let prescriptionSchedule: PrescriptionSchedule = 'NON_SPECIFIE';
      const normSched = rawSchedule.toUpperCase();
      if (normSched.includes('LISTE I') && !normSched.includes('LISTE II')) prescriptionSchedule = 'LISTE I';
      else if (normSched.includes('LISTE II')) prescriptionSchedule = 'LISTE II';
      else if (normSched.includes('STUPEFIANT')) prescriptionSchedule = 'STUPEFIANT';

      // Product classification (GE / RE / BIO)
      let productClassification: ProductClassification = 'UNKNOWN';
      if (rawType === 'GE') productClassification = 'GE';
      else if (rawType === 'RE') productClassification = 'RE';
      else if (rawType === 'BIO') productClassification = 'BIO';

      // Manufacturing origin (F = Local, I = Import)
      let manufacturingOrigin: ManufacturingOrigin = 'UNKNOWN';
      if (rawStatut === 'F') manufacturingOrigin = 'F';
      else if (rawStatut === 'I') manufacturingOrigin = 'I';

      const recordId = `${sheetCfg.idPrefix}-${rowNumber}`;

      const record: PharmaceuticalRecord = {
        id: recordId,
        sourceList: sheetCfg.listType,
        registrationNumber,
        code,
        dci,
        brandName,
        form,
        dosage,
        packaging,
        prescriptionSchedule,
        rawPrescriptionSchedule: rawSchedule,
        hospitalUse: p1Raw.includes('HOP'),
        officineUse: p2Raw.includes('OFF'),
        laboratory: lab,
        country,
        initialRegistrationDate: initialDate,
        finalRegistrationDate: finalDate,
        withdrawalDate,
        withdrawalReason,
        shelfLife,
        observations,
        productClassification,
        manufacturingOrigin,
        provenance: {
          sourceWorksheet: sheetCfg.sheetName,
          sourceRow: rowNumber,
          snapshotDate: config.snapshotDate,
        },
      };

      allRecords.push(record);
      sheetRecordCount++;
    }

    if (sheetCfg.listType === 'NOMENCLATURE_ACTIVE') listCounts.nomenclatureActive = sheetRecordCount;
    else if (sheetCfg.listType === 'NON_RENOUVELE') listCounts.nonRenouveles = sheetRecordCount;
    else if (sheetCfg.listType === 'RETRAIT') listCounts.retraits = sheetRecordCount;

    console.log(`[Worksheet: "${sheetCfg.sheetName}"] Parsed records: ${sheetRecordCount} (expected: ${sheetCfg.expectedCount})`);
    if (sheetRecordCount !== sheetCfg.expectedCount) {
      throw new Error(`Record count mismatch in "${sheetCfg.sheetName}": got ${sheetRecordCount}, expected ${sheetCfg.expectedCount}`);
    }
  }

  // Cross-List Matching & Discrepancy Analysis (excluding sourceList from signature)
  console.log('[PharmaSearch Pipeline] Performing Cross-List & Duplicate Signature Matching...');
  let exactMatchCount = 0;
  let potentialOverlapCount = 0;
  let intraListDuplicateCount = 0;

  // Group records by normalized registration number
  const regMap = new Map<string, PharmaceuticalRecord[]>();
  for (const rec of allRecords) {
    const nReg = normalizeForMatch(rec.registrationNumber);
    if (!nReg || nReg.length < 3) continue;
    if (!regMap.has(nReg)) regMap.set(nReg, []);
    regMap.get(nReg)!.push(rec);
  }

  for (const [, group] of regMap.entries()) {
    if (group.length < 2) continue;

    // Check if duplicates exist within the same list (e.g. SILVEZIN presentations)
    const listSet = new Set(group.map((r) => r.sourceList));
    if (listSet.size < group.length) {
      intraListDuplicateCount++;
    }

    // Pairwise comparison across different lists
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const a = group[i];
        const b = group[j];

        // Only create cross-list discrepancies if from different source lists
        if (a.sourceList === b.sourceList) continue;

        const brandMatch = normalizeForMatch(a.brandName) === normalizeForMatch(b.brandName);
        const dciMatch = normalizeForMatch(a.dci) === normalizeForMatch(b.dci);
        const doseMatch = normalizeForMatch(a.dosage) === normalizeForMatch(b.dosage);
        const formMatch = normalizeForMatch(a.form) === normalizeForMatch(b.form);
        const pkgMatch = normalizeForMatch(a.packaging) === normalizeForMatch(b.packaging);
        const codeMatch = normalizeForMatch(a.code) === normalizeForMatch(b.code);

        const matchingFields: Array<'registrationNumber' | 'brandName' | 'dci' | 'code' | 'dosage' | 'form' | 'packaging'> = [
          'registrationNumber',
        ];
        if (brandMatch) matchingFields.push('brandName');
        if (dciMatch) matchingFields.push('dci');
        if (codeMatch) matchingFields.push('code');
        if (doseMatch) matchingFields.push('dosage');
        if (formMatch) matchingFields.push('form');
        if (pkgMatch) matchingFields.push('packaging');

        const isExact = brandMatch && dciMatch && doseMatch && formMatch && pkgMatch;
        const overlapType = isExact ? 'EXACT_MATCH' : 'POTENTIAL_OVERLAP';

        if (isExact) exactMatchCount++;
        else potentialOverlapCount++;

        const descA = `Correspondance avec ${b.id} (${b.sourceList}): ${isExact ? 'Identité exacte des spécifications' : 'Variations sur forme/conditionnement'}`;
        const descB = `Correspondance avec ${a.id} (${a.sourceList}): ${isExact ? 'Identité exacte des spécifications' : 'Variations sur forme/conditionnement'}`;

        const discA: ListDiscrepancy = {
          targetRecordId: b.id,
          targetList: b.sourceList,
          overlapType,
          matchingFields,
          description: descA,
        };

        const discB: ListDiscrepancy = {
          targetRecordId: a.id,
          targetList: a.sourceList,
          overlapType,
          matchingFields,
          description: descB,
        };

        if (!a.discrepancies) a.discrepancies = [];
        a.discrepancies.push(discA);

        if (!b.discrepancies) b.discrepancies = [];
        b.discrepancies.push(discB);
      }
    }
  }

  const metadata: DatasetMetadata = {
    sourceSnapshotDate: config.snapshotDate,
    officialSourceUrl: 'https://www.miph.gov.dz/',
    sourceMinistry: "Ministère de l'Industrie Pharmaceutique",
    sourceDirection: 'Direction de la Pharmaco-Économie, des Activités Pharmaceutiques et de la Régulation',
    generatedAt: new Date().toISOString(),
    totalSourceRows: allRecords.length,
    listCounts,
    discrepancyCounts: {
      exactMatches: exactMatchCount,
      potentialOverlaps: potentialOverlapCount,
      intraListDuplicates: intraListDuplicateCount,
    },
    warningCounts: {
      ambiguousDates: ambiguousDateCount,
      missingCriticalFields: missingCriticalCount,
      crossListDiscrepancies: exactMatchCount + potentialOverlapCount,
    },
  };

  const dataset: NomenclatureDataset = {
    metadata,
    records: allRecords,
  };

  // Write output
  const outputDir = path.dirname(config.outputJsonPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`[PharmaSearch Pipeline] Writing JSON dataset to: ${config.outputJsonPath}`);
  fs.writeFileSync(config.outputJsonPath, JSON.stringify(dataset), 'utf-8');

  const stats = fs.statSync(config.outputJsonPath);
  console.log(`[PharmaSearch Pipeline] Generated successfully in ${Date.now() - startTime}ms.`);
  console.log(`[PharmaSearch Pipeline] File Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB (${stats.size.toLocaleString()} bytes)`);

  return dataset;
}

import { fileURLToPath } from 'url';

// Direct execution from CLI
const isDirectRun =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isDirectRun) {
  processWorkbook()
    .then((ds) => {
      console.log('Total Records Generated:', ds.records.length);
      console.log('List Breakdown:', ds.metadata.listCounts);
      console.log('Discrepancy Breakdown:', ds.metadata.discrepancyCounts);
      console.log('Warnings Summary:', ds.metadata.warningCounts);
    })
    .catch((err) => {
      console.error('Pipeline failed:', err);
      process.exit(1);
    });
}

