import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import type {
  TimelineEvent,
  VersionChangeItem,
  MedicineHistoryItem,
  PharmaceuticalRecord,
} from '../src/types/pharmaceutical';

export interface EditionMeta {
  id: string; // e.g. '2024-08'
  label: string; // e.g. 'Août 2024'
  file: string;
  hRows: [number, number, number]; // [ActiveHeader, NonRenouvelesHeader, RetraitsHeader]
  date: string; // ISO date '2024-08-31'
}

export const EDITIONS: EditionMeta[] = [
  { id: '2024-08', label: 'Août 2024', file: 'version-AOUT-2024.xlsx', hRows: [17, 12, 11], date: '2024-08-31' },
  { id: '2024-12', label: 'Décembre 2024', file: 'nomenclature-DECEMBRE-2024.xlsx', hRows: [17, 14, 12], date: '2024-12-31' },
  { id: '2025-03', label: 'Mars 2025', file: 'NOMENCLATURE-VERSION-MARS-2025.xlsx', hRows: [17, 12, 11], date: '2025-03-31' },
  { id: '2025-05', label: 'Mai 2025', file: 'NOMENCLATURE-VERSION-MAI-2025.xlsx', hRows: [17, 12, 11], date: '2025-05-31' },
  { id: '2025-06', label: 'Juin 2025', file: 'NOMENCLATURE-VERSION-JUILLET-2025.xlsx', hRows: [17, 12, 11], date: '2025-06-30' },
  { id: '2025-09', label: 'Septembre 2025', file: 'NOMENCLATURE-VERSION-SEPTEMBRE-2025.xlsx', hRows: [16, 12, 11], date: '2025-09-30' },
  { id: '2025-10', label: 'Octobre 2025', file: 'NOMENCLATURE-VERSION-OCTOBRE-2025.xlsx', hRows: [14, 14, 14], date: '2025-10-31' },
  { id: '2025-11', label: 'Novembre 2025', file: 'NOMENCLATURE-VERSION-NOVEMBRE-2025.xlsx', hRows: [14, 14, 14], date: '2025-11-30' },
  { id: '2025-12', label: 'Décembre 2025', file: 'NOMENCLATURE-VERSION-DECEMBRE-2025.xlsx', hRows: [14, 14, 14], date: '2025-12-31' },
  { id: '2026-02', label: 'Février 2026', file: 'NOMENCLATURE-VERSION-FEVRIER-2026-.xlsx', hRows: [14, 14, 14], date: '2026-02-28' },
  { id: '2026-04', label: 'Avril 2026', file: 'NOMENCLATURE.VERSION.AVRIL_.2026-.xlsx', hRows: [14, 14, 14], date: '2026-04-30' },
  { id: '2026-06', label: 'Juin 2026', file: 'clean_NOMENCLATURE.VERSION.JUIN_.2026- (1).xlsx', hRows: [14, 14, 14], date: '2026-06-30' },
  { id: '2026-08', label: 'Août 2026', file: 'clean_NOMENCLATURE.VERSION.AOUT_.2026- (2).xlsx', hRows: [16, 12, 11], date: '2026-08-31' },
];

export interface VersionSnapshotEntry {
  editionId: string;
  editionLabel: string;
  editionDate: string;
  sourceList: 'NOMENCLATURE_ACTIVE' | 'NON_RENOUVELE' | 'RETRAIT';
  brandName: string;
  packaging?: string;
  laboratory?: string;
  country?: string;
  manufacturingOrigin?: string; // 'F' | 'I'
  productClassification?: string; // 'GE' | 'RE' | 'BIO'
  withdrawalDate?: string;
  withdrawalReason?: string;
  sourceRow: number;
}

function cleanStr(val: unknown): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') {
    const obj = val as Record<string, unknown>;
    if (obj.text) return String(obj.text).trim();
    if (Array.isArray(obj.richText)) {
      return (obj.richText as Array<{ text?: string }>).map((t) => t.text || '').join('').trim();
    }
    if (val instanceof Date) return val.toISOString().slice(0, 10);
  }
  return String(val).trim();
}

function cleanDateStr(val: unknown): string {
  if (!val) return '';
  if (val instanceof Date) return val.toLocaleDateString('fr-FR');
  const s = cleanStr(val);
  return s;
}

export async function buildNomenclatureHistory(
  nomoclaturesDir = 'NOMOCLATURES',
  outputDir = 'public/data/history'
): Promise<number> {
  console.log('Loading baseline public/data/nomenclature.json...');
  const baseline = JSON.parse(fs.readFileSync('public/data/nomenclature.json', 'utf8'));
  const currentRecords = baseline.records as Array<PharmaceuticalRecord>;

  const currentMap = new Map<string, PharmaceuticalRecord[]>();
  currentRecords.forEach(r => {
    const reg = (r.registrationNumber || '').trim();
    if (!currentMap.has(reg)) currentMap.set(reg, []);
    currentMap.get(reg)!.push(r);
  });

  // Load Annual new grants 2021-2025
  const annualGrants = new Map<string, number>();
  for (const yr of [2021, 2022, 2023, 2024, 2025]) {
    const fPath = path.join(nomoclaturesDir, `${yr}.xlsx`);
    if (fs.existsSync(fPath)) {
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.readFile(fPath);
      const ws = wb.worksheets[0];
      for (let r = 12; r <= ws.rowCount; r++) {
        const row = ws.getRow(r).values as unknown[];
        if (row && row[2]) {
          const reg = cleanStr(row[2]);
          if (reg && !annualGrants.has(reg)) {
            annualGrants.set(reg, yr);
          }
        }
      }
    }
  }
  console.log(`Annual new grant records loaded: ${annualGrants.size}`);

  const recordSnapshots = new Map<string, Map<string, VersionSnapshotEntry>>();
  currentRecords.forEach(r => {
    recordSnapshots.set(r.id, new Map());
  });

  // Process 13 snapshot workbooks
  for (const ed of EDITIONS) {
    const fPath = path.join(nomoclaturesDir, ed.file);
    if (!fs.existsSync(fPath)) {
      console.warn(`File ${fPath} not found, skipping.`);
      continue;
    }

    console.log(`Processing edition ${ed.label} (${ed.file})...`);
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(fPath);

    const sheetConfigs = [
      { ws: wb.worksheets[0], list: 'NOMENCLATURE_ACTIVE' as const, hRow: ed.hRows[0] },
      { ws: wb.worksheets[1], list: 'NON_RENOUVELE' as const, hRow: ed.hRows[1] },
      { ws: wb.worksheets[2], list: 'RETRAIT' as const, hRow: ed.hRows[2] },
    ];

    for (const sc of sheetConfigs) {
      if (!sc.ws) continue;
      const isRetrait = sc.list === 'RETRAIT';

      for (let rNum = sc.hRow + 1; rNum <= sc.ws.rowCount; rNum++) {
        const row = sc.ws.getRow(rNum).values as unknown[];
        if (!row || !row[2]) continue;

        const regNum = cleanStr(row[2]);
        if (!regNum || !currentMap.has(regNum)) continue;

        const candidates = currentMap.get(regNum)!;
        let matchedRecord = candidates[0];

        if (candidates.length > 1) {
          const rowBrand = cleanStr(row[5]).toUpperCase();
          const best = candidates.find(c => 
            c.brandName.toUpperCase() === rowBrand ||
            (rowBrand.includes(c.brandName.toUpperCase()) || c.brandName.toUpperCase().includes(rowBrand))
          );
          if (best) matchedRecord = best;
        }

        const brandName = cleanStr(row[5]);
        const packaging = cleanStr(row[8]);
        const laboratory = isRetrait ? cleanStr(row[12]) : cleanStr(row[13]);
        const country = isRetrait ? cleanStr(row[13]) : cleanStr(row[14]);
        const productClassification = isRetrait ? cleanStr(row[15]) : cleanStr(row[17]);
        const manufacturingOrigin = isRetrait ? cleanStr(row[16]) : cleanStr(row[18]);
        const withdrawalDate = isRetrait ? cleanDateStr(row[17]) : undefined;
        const withdrawalReason = isRetrait ? cleanStr(row[18]) : undefined;

        const snapshot: VersionSnapshotEntry = {
          editionId: ed.id,
          editionLabel: ed.label,
          editionDate: ed.date,
          sourceList: sc.list,
          brandName,
          packaging: packaging || undefined,
          laboratory: laboratory || undefined,
          country: country || undefined,
          productClassification: productClassification || undefined,
          manufacturingOrigin: manufacturingOrigin || undefined,
          withdrawalDate: withdrawalDate || undefined,
          withdrawalReason: withdrawalReason || undefined,
          sourceRow: rNum,
        };

        const existingMap = recordSnapshots.get(matchedRecord.id);
        if (existingMap && !existingMap.has(ed.id)) {
          existingMap.set(ed.id, snapshot);
        }
      }
    }
  }

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`Writing timeline history files to ${outputDir}...`);
  let totalWritten = 0;

  for (const record of currentRecords) {
    const snapshotsMap = recordSnapshots.get(record.id) || new Map();
    const annualYr = annualGrants.get(record.registrationNumber.trim());

    const events: TimelineEvent[] = [];

    // 1. Initial Registration event
    if (record.initialRegistrationDate?.formatted && !record.initialRegistrationDate.isInvalidDate) {
      events.push({
        editionId: 'INIT',
        editionLabel: `Enregistrement Initial`,
        editionDate: record.initialRegistrationDate.isoDate || record.initialRegistrationDate.raw,
        type: 'INITIAL_REGISTRATION',
        sourceList: 'NOMENCLATURE_ACTIVE',
        badgeLabelFr: 'Décision Initiale',
        badgeLabelAr: 'القرار الأولي',
        titleFr: `Autorisation initiale de mise sur le marché (AMM N° ${record.registrationNumber})`,
        titleAr: `الترخيص الأولي لطرح الدواء في السوق (رقم ${record.registrationNumber})`,
        details: {
          'Date initiale': record.initialRegistrationDate.formatted,
          'Laboratoire': record.laboratory,
          'Pays': record.country,
        }
      });
    }

    // 2. Annual register tag (2021-2025)
    if (annualYr) {
      events.push({
        editionId: `ANNUAL-${annualYr}`,
        editionLabel: `Enregistrements ${annualYr}`,
        editionDate: `${annualYr}-12-31`,
        type: 'INITIAL_REGISTRATION',
        sourceList: 'NOMENCLATURE_ACTIVE',
        badgeLabelFr: `Liste Annuelle ${annualYr}`,
        badgeLabelAr: `القائمة السنوية ${annualYr}`,
        titleFr: `Inclus dans le recueil ministériel des nouveaux enregistrements de l'année ${annualYr}`,
        titleAr: `مدرج ضمن السجل الوزاري للأدوية الجديدة المسجلة لسنة ${annualYr}`,
      });
    }

    // 3. Chronological snapshots comparison across 2024-2026
    let prevSnapshot: VersionSnapshotEntry | null = null;
    let firstSeen = '';
    let lastSeen = '';

    for (const ed of EDITIONS) {
      const snap = snapshotsMap.get(ed.id);
      if (!snap) continue;

      if (!firstSeen) firstSeen = ed.label;
      lastSeen = ed.label;

      if (!prevSnapshot) {
        // First observation in the 2024-2026 series
        events.push({
          editionId: ed.id,
          editionLabel: ed.label,
          editionDate: ed.date,
          type: 'APPEARED',
          sourceList: snap.sourceList,
          badgeLabelFr: snap.sourceList === 'NOMENCLATURE_ACTIVE' ? 'Nomenclature active' : snap.sourceList === 'NON_RENOUVELE' ? 'Non renouvelé' : 'Retiré',
          badgeLabelAr: snap.sourceList === 'NOMENCLATURE_ACTIVE' ? 'قائمة نشطة' : snap.sourceList === 'NON_RENOUVELE' ? 'غير مجدد' : 'مسحوب',
          titleFr: `Observé dans la Nomenclature officielle de ${ed.label} (${snap.sourceList === 'NOMENCLATURE_ACTIVE' ? 'Registre actif' : snap.sourceList === 'NON_RENOUVELE' ? 'Registre des non-renouvelés' : 'Registre des retraits'})`,
          titleAr: `تمت معاينته في النشرة الرسمية لشهر ${ed.label}`,
          details: {
            'Laboratoire': snap.laboratory || record.laboratory,
            'Conditionnement': snap.packaging || record.packaging,
          }
        });
      } else {
        const changes: VersionChangeItem[] = [];

        // Status change
        if (prevSnapshot.sourceList !== snap.sourceList) {
          const listLabelFr = (l: string) => l === 'NOMENCLATURE_ACTIVE' ? 'Nomenclature active' : l === 'NON_RENOUVELE' ? 'Non renouvelé' : 'Retiré';
          changes.push({
            field: 'sourceList',
            oldValue: listLabelFr(prevSnapshot.sourceList),
            newValue: listLabelFr(snap.sourceList),
            labelFr: 'Statut réglementaire',
            labelAr: 'الوضع التنظيمي',
          });
        }

        // Packaging change
        if (prevSnapshot.packaging && snap.packaging && prevSnapshot.packaging !== snap.packaging) {
          changes.push({
            field: 'packaging',
            oldValue: prevSnapshot.packaging,
            newValue: snap.packaging,
            labelFr: 'Conditionnement',
            labelAr: 'التعليب',
          });
        }

        // Laboratory transfer
        if (prevSnapshot.laboratory && snap.laboratory && prevSnapshot.laboratory !== snap.laboratory) {
          changes.push({
            field: 'laboratory',
            oldValue: prevSnapshot.laboratory,
            newValue: snap.laboratory,
            labelFr: 'Laboratoire détenteur',
            labelAr: 'المخبر الحائز على التسجيل',
          });
        }

        // Brand name adjustment
        if (prevSnapshot.brandName && snap.brandName && prevSnapshot.brandName !== snap.brandName) {
          changes.push({
            field: 'brandName',
            oldValue: prevSnapshot.brandName,
            newValue: snap.brandName,
            labelFr: 'Nom commercial',
            labelAr: 'الاسم التجاري',
          });
        }

        if (snap.sourceList === 'RETRAIT' && prevSnapshot.sourceList !== 'RETRAIT') {
          events.push({
            editionId: ed.id,
            editionLabel: ed.label,
            editionDate: ed.date,
            type: 'WITHDRAWAL',
            sourceList: 'RETRAIT',
            badgeLabelFr: 'Passage en Retrait officiel',
            badgeLabelAr: 'سحب رسمي',
            titleFr: `Passage de la spécialité au registre officiel des retraits en ${ed.label}`,
            titleAr: `نقل الدواء إلى قائمة السحب الرسمية في ${ed.label}`,
            changes,
            details: {
              ...(snap.withdrawalDate ? { 'Date de retrait': snap.withdrawalDate } : {}),
              ...(snap.withdrawalReason ? { 'Motif officiel': snap.withdrawalReason } : {}),
            }
          });
        } else if (changes.length > 0) {
          events.push({
            editionId: ed.id,
            editionLabel: ed.label,
            editionDate: ed.date,
            type: changes.some(c => c.field === 'sourceList') ? 'STATUS_CHANGE' : 'FIELD_MODIFICATION',
            sourceList: snap.sourceList,
            badgeLabelFr: changes.some(c => c.field === 'sourceList') ? 'Changement de statut' : 'Modification technique',
            badgeLabelAr: changes.some(c => c.field === 'sourceList') ? 'تغيير في الوضع التنظيمي' : 'تعديل تقني',
            titleFr: `Évolution des données dans la publication de ${ed.label}`,
            titleAr: `تحديث للبيانات الرسمية في طبعة ${ed.label}`,
            changes,
          });
        }
      }

      prevSnapshot = snap;
    }

    // 4. Final confirmed status event in Août 2026 baseline
    events.push({
      editionId: '2026-08',
      editionLabel: 'Août 2026 (Actuel)',
      editionDate: '2026-08-31',
      type: 'CONFIRMED',
      sourceList: record.sourceList,
      badgeLabelFr: record.sourceList === 'NOMENCLATURE_ACTIVE' ? 'Actif au 31/08/2026' : record.sourceList === 'NON_RENOUVELE' ? 'Non renouvelé au 31/08/2026' : 'Retiré au 31/08/2026',
      badgeLabelAr: record.sourceList === 'NOMENCLATURE_ACTIVE' ? 'سارٍ حتى 31/08/2026' : record.sourceList === 'NON_RENOUVELE' ? 'غير مجدد في 31/08/2026' : 'مسحوب في 31/08/2026',
      titleFr: `Situation administrative arrêtée au 31 Août 2026 (${record.sourceList === 'NOMENCLATURE_ACTIVE' ? 'Nomenclature active' : record.sourceList === 'NON_RENOUVELE' ? 'Non renouvelé' : 'Retiré'})`,
      titleAr: `الوضعية الإدارية المعتمدة حتى 31 أوت 2026`,
      details: {
        'Laboratoire': record.laboratory,
        'Conditionnement': record.packaging,
        ...(record.finalRegistrationDate?.formatted ? { 'Dernière date': record.finalRegistrationDate.formatted } : {})
      }
    });

    const item: MedicineHistoryItem = {
      recordId: record.id,
      registrationNumber: record.registrationNumber,
      firstSeenEdition: firstSeen || 'Août 2026',
      lastSeenEdition: lastSeen || 'Août 2026',
      annualNewGrantYear: annualYr,
      events,
    };

    const filePath = path.join(outputDir, `${record.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(item));
    totalWritten++;
  }

  console.log(`Generated ${totalWritten} history records in ${outputDir}.`);
  return totalWritten;
}

if (process.argv[1] && process.argv[1].endsWith('generate-nomenclature-history.ts')) {
  buildNomenclatureHistory().catch(err => {
    console.error('Error generating nomenclature history:', err);
    process.exit(1);
  });
}
