import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import type { NomenclatureDataset } from '@/types';
import { PharmaceuticalSearchService, normalizeDiacritics } from '@/services/searchService';

describe('Stage 3: Data Pipeline, JSON Dataset & Search Service Validation', () => {
  let dataset: NomenclatureDataset;
  let searchService: PharmaceuticalSearchService;
  const jsonPath = path.resolve(process.cwd(), 'public/data/nomenclature.json');

  beforeAll(() => {
    expect(fs.existsSync(jsonPath)).toBe(true);
    const raw = fs.readFileSync(jsonPath, 'utf-8');
    dataset = JSON.parse(raw);
    searchService = new PharmaceuticalSearchService(dataset);
  });

  it('1. Exactly 5,425 records are parsed from the main nomenclature', () => {
    expect(dataset.metadata.listCounts.nomenclatureActive).toBe(5425);
    const count = dataset.records.filter((r) => r.sourceList === 'NOMENCLATURE_ACTIVE').length;
    expect(count).toBe(5425);
  });

  it('2. Exactly 1,491 records are parsed from the non-renewed list', () => {
    expect(dataset.metadata.listCounts.nonRenouveles).toBe(1491);
    const count = dataset.records.filter((r) => r.sourceList === 'NON_RENOUVELE').length;
    expect(count).toBe(1491);
  });

  it('3. Exactly 2,679 records are parsed from the withdrawal list', () => {
    expect(dataset.metadata.listCounts.retraits).toBe(2679);
    const count = dataset.records.filter((r) => r.sourceList === 'RETRAIT').length;
    expect(count).toBe(2679);
  });

  it('4. The combined JSON contains exactly 9,595 source records', () => {
    expect(dataset.metadata.totalSourceRows).toBe(9595);
    expect(dataset.records.length).toBe(9595);
  });

  it('5. Every generated record has a unique, deterministic, stable ID', () => {
    const ids = dataset.records.map((r) => r.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(9595);

    // Verify format prefixes
    for (const rec of dataset.records) {
      if (rec.sourceList === 'NOMENCLATURE_ACTIVE') {
        expect(rec.id).toMatch(/^NOM-\d+$/);
      } else if (rec.sourceList === 'NON_RENOUVELE') {
        expect(rec.id).toMatch(/^NON-\d+$/);
      } else if (rec.sourceList === 'RETRAIT') {
        expect(rec.id).toMatch(/^RET-\d+$/);
      }
    }
  });

  it('6. No source row is silently dropped or merged', () => {
    // Check that sourceRow indices correspond to the workbook rows
    const nomRows = dataset.records.filter((r) => r.sourceList === 'NOMENCLATURE_ACTIVE');
    expect(nomRows[0].provenance.sourceRow).toBe(17);
    expect(nomRows[nomRows.length - 1].provenance.sourceRow).toBe(5441);

    const nonRows = dataset.records.filter((r) => r.sourceList === 'NON_RENOUVELE');
    expect(nonRows[0].provenance.sourceRow).toBe(13);
    expect(nonRows[nonRows.length - 1].provenance.sourceRow).toBe(1503);

    const retRows = dataset.records.filter((r) => r.sourceList === 'RETRAIT');
    expect(retRows[0].provenance.sourceRow).toBe(12);
    expect(retRows[retRows.length - 1].provenance.sourceRow).toBe(2690);
  });

  it('7. Sheet-specific header mapping is correct, including column shifts in Retraits', () => {
    // Retraits sheet omits OBS and FINAL DATE, so Col L is Laboratory and Col Q is Withdrawal Date
    const sampleRetrait = dataset.records.find((r) => r.id === 'RET-12');
    expect(sampleRetrait).toBeDefined();
    expect(sampleRetrait?.sourceList).toBe('RETRAIT');
    expect(sampleRetrait?.brandName).toBe('ASTEMIZOL RATIOPHARM');
    expect(sampleRetrait?.laboratory).not.toBe('');
    expect(sampleRetrait?.country).not.toBe('');
    expect(sampleRetrait?.withdrawalDate).toBeDefined();
    expect(sampleRetrait?.withdrawalReason).toBeDefined();

    // Nomenclature sheet has shelfLife
    const sampleNom = dataset.records.find((r) => r.id === 'NOM-17');
    expect(sampleNom).toBeDefined();
    expect(sampleNom?.brandName).toBe('ARTIZ');
    expect(sampleNom?.shelfLife).toBeDefined();
    expect(sampleNom?.withdrawalDate).toBeUndefined();
  });

  it('8. Duplicate registration numbers with different presentations remain distinct', () => {
    // SILVEZIN: reg "406/07 P 079/26" appears on NOM-2000 and NOM-2001
    const silvezinRows = dataset.records.filter(
      (r) => r.registrationNumber === '406/07 P 079/26' && r.sourceList === 'NOMENCLATURE_ACTIVE'
    );
    expect(silvezinRows.length).toBe(2);
    expect(silvezinRows[0].id).toBe('NOM-2000');
    expect(silvezinRows[1].id).toBe('NOM-2001');
    expect(silvezinRows[0].packaging).toBe('T/50G');
    expect(silvezinRows[1].packaging).toBe('POT DE 500G');

    // RANITIDAL in Retraits: reg "039/10 A 002/12" appears on RET-1152 and RET-1155
    const ranitidalRows = dataset.records.filter(
      (r) => r.registrationNumber === '039/10 A 002/12' && r.sourceList === 'RETRAIT'
    );
    expect(ranitidalRows.length).toBe(2);
    expect(ranitidalRows[0].id).toBe('RET-1152');
    expect(ranitidalRows[1].id).toBe('RET-1155');
  });

  it('9. Cross-list matching excludes list membership from matching signature and preserves both source records', () => {
    // ABILIFY MAINTENA (602/16 D 175/23) exists in NOMENCLATURE_ACTIVE and RETRAIT
    const abilifyNom = dataset.records.find((r) => r.id === 'NOM-4460');
    const abilifyRet = dataset.records.find((r) => r.id === 'RET-2333');

    expect(abilifyNom).toBeDefined();
    expect(abilifyRet).toBeDefined();
    expect(abilifyNom?.registrationNumber).toBe('602/16 D 175/23');
    expect(abilifyRet?.registrationNumber).toBe('602/16 D 175/23');

    // Discrepancy link on active record
    expect(abilifyNom?.discrepancies).toBeDefined();
    const linkOnNom = abilifyNom?.discrepancies?.find((d) => d.targetRecordId === 'RET-2333');
    expect(linkOnNom).toBeDefined();
    expect(linkOnNom?.overlapType).toBe('EXACT_MATCH');
    expect(linkOnNom?.targetList).toBe('RETRAIT');

    // Discrepancy link on withdrawal record
    expect(abilifyRet?.discrepancies).toBeDefined();
    const linkOnRet = abilifyRet?.discrepancies?.find((d) => d.targetRecordId === 'NOM-4460');
    expect(linkOnRet).toBeDefined();
    expect(linkOnRet?.overlapType).toBe('EXACT_MATCH');

    // Verify total cross-list overlaps (37 exact + 4 partial = 41 pairs)
    expect(dataset.metadata.discrepancyCounts.exactMatches).toBe(37);
    expect(dataset.metadata.discrepancyCounts.potentialOverlaps).toBe(4);
  });

  it('10. Invalid dates, administrative date-field text, and blank dates are handled distinctly (with row 3277 vs 3674 reconciliation)', () => {
    // 1. Reconciliation check for Stage 1 report discrepancy:
    // Malformed text date "00/00/2019" occurs at Worksheet Row 3277 (NOM-3277)
    const malformedRec = dataset.records.find((r) => r.id === 'NOM-3277');
    expect(malformedRec).toBeDefined();
    expect(malformedRec?.provenance.sourceRow).toBe(3277);
    expect(malformedRec?.brandName).toBe('SOFOSBUVIR MERINAL');
    expect(malformedRec?.dci).toBe('SOFOSBUVIR');
    expect(malformedRec?.initialRegistrationDate.isInvalidDate).toBe(true);
    expect(malformedRec?.initialRegistrationDate.isoDate).toBeNull();
    expect(malformedRec?.initialRegistrationDate.raw).toBe('00/00/2019');
    expect(malformedRec?.initialRegistrationDate.warning).toBeDefined();

    // Verify row 3674 (NOM-3674) is a completely different record with a valid date
    const row3674Rec = dataset.records.find((r) => r.id === 'NOM-3674');
    expect(row3674Rec).toBeDefined();
    expect(row3674Rec?.provenance.sourceRow).toBe(3674);
    expect(row3674Rec?.brandName).toBe('MAGNE');
    expect(row3674Rec?.initialRegistrationDate.isInvalidDate).toBe(false);
    expect(row3674Rec?.initialRegistrationDate.isoDate).toBe('2006-10-17');
    expect(row3674Rec?.initialRegistrationDate.formatted).toBe('17/10/2006');

    // Confirm "00/00/2019" occurs exactly once across all 9,595 records
    const allMalformedDates = dataset.records.filter(
      (r) => r.initialRegistrationDate.raw === '00/00/2019'
    );
    expect(allMalformedDates.length).toBe(1);
    expect(allMalformedDates[0].id).toBe('NOM-3277');

    // 2. Administrative text "RETRAIT" in Retraits date column
    const retraitAdmin = dataset.records.find((r) => r.id === 'RET-13');
    expect(retraitAdmin).toBeDefined();
    expect(retraitAdmin?.withdrawalDate?.isAdministrativeTag).toBe(true);
    expect(retraitAdmin?.withdrawalDate?.isInvalidDate).toBe(false);
    expect(retraitAdmin?.withdrawalDate?.raw.toUpperCase()).toContain('RETRAIT');

    // 3. Valid date conversion
    const validRec = dataset.records.find((r) => r.id === 'NOM-17');
    expect(validRec?.initialRegistrationDate.isInvalidDate).toBe(false);
    expect(validRec?.initialRegistrationDate.isoDate).toBe('2006-07-31');
    expect(validRec?.initialRegistrationDate.formatted).toBe('31/07/2006');

    // 4. Blank date handling
    const blankFinalDate = dataset.records.find((r) => !r.finalRegistrationDate?.raw);
    expect(blankFinalDate).toBeDefined();
    expect(blankFinalDate?.finalRegistrationDate?.isoDate).toBeNull();
    expect(blankFinalDate?.finalRegistrationDate?.isInvalidDate).toBe(false);
  });

  it('11. Original source codes and field values are not silently reinterpreted', () => {
    // Blank LISTE must not be OTC
    const blankSchedRecs = dataset.records.filter((r) => !r.rawPrescriptionSchedule);
    expect(blankSchedRecs.length).toBeGreaterThan(0);
    for (const r of blankSchedRecs.slice(0, 50)) {
      expect(r.prescriptionSchedule).toBe('NON_SPECIFIE');
    }

    // STATUT column corresponds to F (local) or I (import)
    const localRec = dataset.records.find((r) => r.id === 'NOM-17');
    expect(localRec?.manufacturingOrigin).toBe('F');

    const importRec = dataset.records.find((r) => r.id === 'NOM-19');
    expect(importRec?.manufacturingOrigin).toBe('I');

    // TYPE column corresponds to GE, RE, BIO
    expect(localRec?.productClassification).toBe('GE');
  });

  it('12. Search returns expected records across all required fields: brand, DCI, registration-number, code, laboratory, dosage, and form', () => {
    // 1. Search by brand name
    const brandRes = searchService.search('ARTIZ');
    expect(brandRes.totalHits).toBeGreaterThan(0);
    expect(brandRes.records[0].brandName).toBe('ARTIZ');

    // 2. Search by DCI
    const dciRes = searchService.search('CETIRIZINE');
    expect(dciRes.totalHits).toBeGreaterThan(0);
    expect(dciRes.records.some((r) => r.dci.includes('CETIRIZINE'))).toBe(true);

    // 3. Search by registration number
    const regRes = searchService.search('352/01 A 003/06/22');
    expect(regRes.totalHits).toBeGreaterThan(0);
    expect(regRes.records[0].registrationNumber).toBe('352/01 A 003/06/22');

    // 4. Search by product classification code
    const codeRes = searchService.search('01 A 003');
    expect(codeRes.totalHits).toBeGreaterThan(0);
    expect(codeRes.records.some((r) => r.code === '01 A 003')).toBe(true);

    // 5. Search by laboratory
    const labRes = searchService.search('EL KENDI');
    expect(labRes.totalHits).toBeGreaterThan(0);
    expect(labRes.records[0].laboratory).toContain('EL KENDI');

    // 6. Search by dosage
    const doseRes = searchService.search('400MG');
    expect(doseRes.totalHits).toBeGreaterThan(0);
    expect(doseRes.records.some((r) => r.dosage.includes('400MG'))).toBe(true);

    // 7. Search by pharmaceutical form
    const formRes = searchService.search('COMPRIME PELLICULE');
    expect(formRes.totalHits).toBeGreaterThan(0);
    expect(formRes.records.some((r) => r.form.includes('COMPRIME'))).toBe(true);

    // 8. Filter by sourceList
    const filteredRes = searchService.search('CETIRIZINE', {
      sourceList: ['NOMENCLATURE_ACTIVE'],
    });
    expect(filteredRes.records.every((r) => r.sourceList === 'NOMENCLATURE_ACTIVE')).toBe(true);
  });

  it('13. Search execution benchmark across representative query types on all 9,595 records', () => {
    // Benchmark 7 query categories: Brand, DCI, Reg#, Code, Laboratory, Dosage, Form
    const benchmarkQueries = [
      { category: 'Brand', query: 'ARTIZ' },
      { category: 'DCI', query: 'PARACETAMOL' },
      { category: 'DCI', query: 'AMOXICILLINE' },
      { category: 'Laboratory', query: 'SAIDAL' },
      { category: 'Form', query: 'COMPRIME' },
      { category: 'Dosage', query: '10MG' },
      { category: 'Code', query: '01 A 003' },
      { category: 'Registration', query: '352/01 A 003/06/22' },
    ];

    const iterations = 5;
    const measurements: Array<{ category: string; query: string; minMs: number; avgMs: number; maxMs: number }> = [];

    // Warmup
    searchService.search('WARMUP');

    for (const item of benchmarkQueries) {
      const times: number[] = [];
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        const res = searchService.search(item.query);
        const elapsed = performance.now() - start;
        times.push(elapsed);
        expect(res.totalHits).toBeGreaterThan(0);
      }
      const minMs = Math.min(...times);
      const maxMs = Math.max(...times);
      const avgMs = times.reduce((a, b) => a + b, 0) / times.length;
      measurements.push({
        category: item.category,
        query: item.query,
        minMs: Number(minMs.toFixed(2)),
        avgMs: Number(avgMs.toFixed(2)),
        maxMs: Number(maxMs.toFixed(2)),
      });
    }

    const overallAvg = measurements.reduce((sum, m) => sum + m.avgMs, 0) / measurements.length;
    const overallMax = Math.max(...measurements.map((m) => m.maxMs));
    const overallMin = Math.min(...measurements.map((m) => m.minMs));

    console.log('\n--- Observed Local Search Benchmark Across 9,595 Records ---');
    console.table(measurements);
    console.log(
      `Summary (${benchmarkQueries.length} queries x ${iterations} iterations): Min = ${overallMin.toFixed(2)}ms, Avg = ${overallAvg.toFixed(2)}ms, Max = ${overallMax.toFixed(2)}ms`
    );

    // Non-fragile threshold: ensures fast responsive performance on any test runner (< 100ms)
    expect(overallAvg).toBeLessThan(50);
    expect(overallMax).toBeLessThan(150);
  });

  it('14. Regression: PARACETAMOL search returns exactly 307 verified matches with zero ID duplicates', () => {
    // 1. Direct search service query
    const results = searchService.search('PARACETAMOL');
    expect(results.totalHits).toBe(307);
    expect(results.records.length).toBe(307);

    // 2. All 307 IDs must be unique
    const uniqueIds = new Set(results.records.map((r) => r.id));
    expect(uniqueIds.size).toBe(307);

    // 3. Breakdown across the 3 independent source lists
    const activeHits = searchService.search('PARACETAMOL', { sourceList: ['NOMENCLATURE_ACTIVE'] });
    const nonRenHits = searchService.search('PARACETAMOL', { sourceList: ['NON_RENOUVELE'] });
    const retraitHits = searchService.search('PARACETAMOL', { sourceList: ['RETRAIT'] });

    expect(activeHits.totalHits).toBe(155);
    expect(nonRenHits.totalHits).toBe(55);
    expect(retraitHits.totalHits).toBe(97);
    expect(activeHits.totalHits + nonRenHits.totalHits + retraitHits.totalHits).toBe(307);

    // 4. Verification that each record has paracetamol in normalized DCI or brandName
    const hasDciOrBrand = results.records.every(
      (r) =>
        normalizeDiacritics(r.dci).includes('paracetamol') ||
        normalizeDiacritics(r.brandName).includes('paracetamol')
    );
    expect(hasDciOrBrand).toBe(true);
    expect(results.totalHits).toBe(307);
  });
});
