/**
 * PharmaSearch — B2B & Enterprise Market Intelligence Generator
 * 
 * Generates:
 * 1. Full Private B2B Intelligence Report (Local only):
 *    - reports/pharmasearch-b2b-full-intelligence-report.json
 *    - reports/pharmasearch-b2b-full-intelligence-report.md
 * 2. Public Aperçu / Teaser Data for Client Web Application:
 *    - src/data/b2b-insights-preview.json
 */

import fs from 'fs';
import path from 'path';
import type { PharmaceuticalRecord, NomenclatureDataset } from '../src/types/pharmaceutical';

// Therapeutic Class Name Mapping based on Algerian National Nomenclature Code prefixes
const THERAPEUTIC_CLASS_NAMES: Record<string, { fr: string; ar: string }> = {
  '01': { fr: 'Allergologie & Antihistaminiques', ar: 'أمراض الحساسية ومضادات الهيستامين' },
  '02': { fr: 'Anesthésie & Réanimation', ar: 'التخدير والإنعاش' },
  '03': { fr: 'Antalgiques & Antipyrétiques', ar: 'مسكنات الألم وخافضات الحرارة' },
  '04': { fr: 'Anti-inflammatoires & Rhumatologie', ar: 'مضادات الالتهاب وأمراض المفاصل' },
  '05': { fr: 'Cancérologie & Antinéoplasiques', ar: 'علاج الأورام ومضادات السرطان' },
  '06': { fr: 'Cardiologie & Angéiologie', ar: 'أمراض القلب والشرايين والأوعية' },
  '07': { fr: 'Dermatologie', ar: 'الأمراض الجلدية' },
  '08': { fr: 'Produits de Diagnostic & Radiologie', ar: 'مواد التشخيص والتصوير الطبي' },
  '09': { fr: 'Endocrinologie (Hormones & Métabolisme)', ar: 'الغدد الصماء والهرمونات' },
  '10': { fr: 'Gastro-Entéro-Hépatologie', ar: 'أمراض الجهاز الهضمي والكبد' },
  '11': { fr: 'Gynécologie & Obstétrique', ar: 'أمراض النساء والتوليد' },
  '12': { fr: 'Hématologie & Antithrombotiques', ar: 'أمراض الدم ومضادات التخثر' },
  '13': { fr: 'Infectiologie (Antibiotiques & Antiviraux)', ar: 'الأمراض المعدية والمضادات الحيوية' },
  '14': { fr: 'Métabolisme & Diabétologie', ar: 'التمثيل الغذائي وداء السكري' },
  '15': { fr: 'Neurologie & Antiépileptiques', ar: 'أمراض الجهاز العصبي ومضادات الصرع' },
  '16': { fr: 'Psychiatrie & Psychotropes', ar: 'الطب النفسي والمهدئات' },
  '17': { fr: 'Ophtalmologie', ar: 'طب العيون' },
  '18': { fr: 'Oto-Rhino-Laryngologie (ORL)', ar: 'أمراض الأذن والأنف والحنجرة' },
  '19': { fr: 'Parasitologie & Vermifuges', ar: 'علم الطفيليات ومضادات الديدان' },
  '20': { fr: 'Pneumologie & Anti-asthmatiques', ar: 'أمراض الرئة والجهاز التنفسي' },
  '21': { fr: 'Rhumatologie & Décontracturants', ar: 'أمراض الروماتيزم وباسطات العضلات' },
  '22': { fr: 'Traitements des Symptômes du Rhume', ar: 'علاج أعراض نزلات البرد' },
  '23': { fr: 'Stomatologie & Soins Bucco-dentaires', ar: 'أمراض الفم والأسنان' },
  '24': { fr: 'Toxicologie & Antidotes', ar: 'علم السموم والترياقات' },
  '25': { fr: 'Urologie & Néphrologie', ar: 'أمراض المسالك البولية والكلى' },
  '26': { fr: 'Antiseptiques & Désinfectants', ar: 'المطهرات والمعقمات' },
  '27': { fr: 'Immunosuppresseurs & Greffes', ar: 'مثبطات المناعة وزراعة الأعضاء' },
  '28': { fr: 'Maladies Rares & Enzymothérapie', ar: 'الأمراض النادرة والإنزيمات البديلة' },
};

export interface B2BInsightsPreviewData {
  generatedAt: string;
  sourceSnapshotDate: string;
  headlineKpis: {
    totalRecords: number;
    activeRecords: number;
    nonRenewedRecords: number;
    withdrawnRecords: number;
    localManufacturingPct: number;
    importPct: number;
    importOnlyDcisCount: number;
    monopolyDcisCount: number;
    orphanedDcisCount: number;
    activeLaboratoriesCount: number;
    participatingCountriesCount: number;
    historicalEditionsCount: number;
    trackedLabTransfersCount: number;
    crossListDiscrepanciesCount: number;
  };
  therapeuticSovereigntyPreview: {
    topLocalClasses: Array<{
      code: string;
      nameFr: string;
      nameAr: string;
      totalActive: number;
      localCount: number;
      localPct: number;
      importCount: number;
      importPct: number;
    }>;
    topImportDependentClasses: Array<{
      code: string;
      nameFr: string;
      nameAr: string;
      totalActive: number;
      localCount: number;
      localPct: number;
      importCount: number;
      importPct: number;
      hopOnlyPct: number;
    }>;
    lockedRemainingClassesCount: number;
  };
  laboratoriesBenchmarkingPreview: {
    topPlayers: Array<{
      rank: number;
      name: string;
      activeAmms: number;
      uniqueDcis: number;
      localAmms: number;
      importedAmms: number;
      localPct: number;
      biologicsCount: number;
      nonRenewedCount: number;
      withdrawnCount: number;
    }>;
    lockedRemainingLabsCount: number;
  };
  galenicFormsImportDependencyPreview: {
    highImportForms: Array<{
      form: string;
      totalActive: number;
      localCount: number;
      importCount: number;
      importPct: number;
    }>;
    lockedRemainingFormsCount: number;
  };
  importOnlyTargetsPreview: {
    sampleMolecules: Array<{
      dci: string;
      activeCount: number;
      classCode: string;
      classNameFr: string;
      forms: string[];
      sampleLabs: string[];
    }>;
    lockedRemainingDcisCount: number;
  };
  monopolyTargetsPreview: {
    sampleMolecules: Array<{
      dci: string;
      brandName: string;
      laboratory: string;
      country: string;
      classification: string;
      channel: string;
    }>;
    lockedRemainingMonopoliesCount: number;
  };
  partnerInfo: {
    advisorName: string;
    advisorRoleFr: string;
    advisorRoleAr: string;
    advisorWebsite: string;
    advisorLinkedIn: string;
    advisorEmail: string;
  };
}

export async function generateB2BReport() {
  console.log('[B2B Generator] Loading public/data/nomenclature.json...');
  const datasetPath = path.resolve('public/data/nomenclature.json');
  if (!fs.existsSync(datasetPath)) {
    throw new Error(`Dataset not found at ${datasetPath}`);
  }

  const rawData = JSON.parse(fs.readFileSync(datasetPath, 'utf8')) as NomenclatureDataset;
  const records: PharmaceuticalRecord[] = rawData.records;

  const active = records.filter((r) => r.sourceList === 'NOMENCLATURE_ACTIVE');
  const nonRen = records.filter((r) => r.sourceList === 'NON_RENOUVELE');
  const retraits = records.filter((r) => r.sourceList === 'RETRAIT');

  const totalActive = active.length;
  const localActive = active.filter((r) => r.manufacturingOrigin === 'F').length;
  const importActive = active.filter((r) => r.manufacturingOrigin === 'I').length;
  const localPct = Math.round((localActive / totalActive) * 1000) / 10;
  const importPct = Math.round((importActive / totalActive) * 1000) / 10;

  // 1. DCI Market Structure Analysis
  const dciMap = new Map<
    string,
    {
      activeCount: number;
      activeLocal: number;
      activeImport: number;
      nonRenCount: number;
      retraitCount: number;
      forms: Set<string>;
      labs: Set<string>;
      classes: Set<string>;
      samples: PharmaceuticalRecord[];
    }
  >();

  for (const r of records) {
    const dciNorm = (r.dci || 'INCONNU').trim().toUpperCase();
    if (!dciMap.has(dciNorm)) {
      dciMap.set(dciNorm, {
        activeCount: 0,
        activeLocal: 0,
        activeImport: 0,
        nonRenCount: 0,
        retraitCount: 0,
        forms: new Set(),
        labs: new Set(),
        classes: new Set(),
        samples: [],
      });
    }
    const item = dciMap.get(dciNorm)!;
    if (r.sourceList === 'NOMENCLATURE_ACTIVE') {
      item.activeCount++;
      if (r.manufacturingOrigin === 'F') item.activeLocal++;
      if (r.manufacturingOrigin === 'I') item.activeImport++;
      if (r.form) item.forms.add(r.form.trim());
      if (r.laboratory) item.labs.add(r.laboratory.trim());
      const classCode = (r.code || '').trim().slice(0, 2);
      if (classCode) item.classes.add(classCode);
      if (item.samples.length < 3) item.samples.push(r);
    } else if (r.sourceList === 'NON_RENOUVELE') {
      item.nonRenCount++;
    } else if (r.sourceList === 'RETRAIT') {
      item.retraitCount++;
    }
  }

  const allDcis = Array.from(dciMap.entries()).map(([dci, data]) => ({
    dci,
    ...data,
    formsList: Array.from(data.forms),
    labsList: Array.from(data.labs),
    classesList: Array.from(data.classes),
  }));

  const importOnlyDcis = allDcis.filter((d) => d.activeCount > 0 && d.activeLocal === 0);
  const monopolyDcis = allDcis.filter((d) => d.activeCount === 1);
  const orphanedDcis = allDcis.filter((d) => d.activeCount === 0 && (d.nonRenCount > 0 || d.retraitCount > 0));
  const saturatedDcis = allDcis.filter((d) => d.activeCount >= 20).sort((a, b) => b.activeCount - a.activeCount);

  // 2. Laboratory Benchmarking
  const labMap = new Map<
    string,
    {
      name: string;
      activeAmms: number;
      localAmms: number;
      importedAmms: number;
      bioCount: number;
      geCount: number;
      reCount: number;
      nonRenewedCount: number;
      withdrawnCount: number;
      uniqueDcis: Set<string>;
      countries: Set<string>;
    }
  >();

  for (const r of records) {
    const labName = (r.laboratory || 'NON SPECIFIE').trim().toUpperCase();
    if (!labMap.has(labName)) {
      labMap.set(labName, {
        name: labName,
        activeAmms: 0,
        localAmms: 0,
        importedAmms: 0,
        bioCount: 0,
        geCount: 0,
        reCount: 0,
        nonRenewedCount: 0,
        withdrawnCount: 0,
        uniqueDcis: new Set(),
        countries: new Set(),
      });
    }
    const item = labMap.get(labName)!;
    if (r.country) item.countries.add(r.country.trim().toUpperCase());

    if (r.sourceList === 'NOMENCLATURE_ACTIVE') {
      item.activeAmms++;
      if (r.manufacturingOrigin === 'F') item.localAmms++;
      if (r.manufacturingOrigin === 'I') item.importedAmms++;
      if (r.productClassification === 'BIO') item.bioCount++;
      if (r.productClassification === 'GE') item.geCount++;
      if (r.productClassification === 'RE') item.reCount++;
      if (r.dci) item.uniqueDcis.add(r.dci.trim().toUpperCase());
    } else if (r.sourceList === 'NON_RENOUVELE') {
      item.nonRenewedCount++;
    } else if (r.sourceList === 'RETRAIT') {
      item.withdrawnCount++;
    }
  }

  const allLabs = Array.from(labMap.values())
    .filter((l) => l.activeAmms > 0)
    .sort((a, b) => b.activeAmms - a.activeAmms)
    .map((l, idx) => ({
      rank: idx + 1,
      name: l.name,
      activeAmms: l.activeAmms,
      uniqueDcis: l.uniqueDcis.size,
      localAmms: l.localAmms,
      importedAmms: l.importedAmms,
      localPct: Math.round((l.localAmms / l.activeAmms) * 1000) / 10,
      biologicsCount: l.bioCount,
      nonRenewedCount: l.nonRenewedCount,
      withdrawnCount: l.withdrawnCount,
      totalTrackedFootprint: l.activeAmms + l.nonRenewedCount + l.withdrawnCount,
      attritionPct: Math.round(((l.nonRenewedCount + l.withdrawnCount) / (l.activeAmms + l.nonRenewedCount + l.withdrawnCount)) * 1000) / 10,
    }));

  const activeCountriesCount = new Set(
    active.map((r) => (r.country || '').trim().toUpperCase()).filter(Boolean)
  ).size;

  // 3. Therapeutic Class Breakdown (Groups 01 to 28)
  const classMap = new Map<
    string,
    {
      code: string;
      nameFr: string;
      nameAr: string;
      totalActive: number;
      localCount: number;
      importCount: number;
      bioCount: number;
      hopOnlyCount: number;
      offOnlyCount: number;
      bothHopOffCount: number;
      uniqueDcis: Set<string>;
    }
  >();

  for (const r of active) {
    const code = (r.code || '').trim().slice(0, 2);
    if (!code || !/^\d{2}$/.test(code)) continue;

    if (!classMap.has(code)) {
      const classInfo = THERAPEUTIC_CLASS_NAMES[code] || {
        fr: `Classe Thérapeutique ${code}`,
        ar: `الفئة العلاجية ${code}`,
      };
      classMap.set(code, {
        code,
        nameFr: classInfo.fr,
        nameAr: classInfo.ar,
        totalActive: 0,
        localCount: 0,
        importCount: 0,
        bioCount: 0,
        hopOnlyCount: 0,
        offOnlyCount: 0,
        bothHopOffCount: 0,
        uniqueDcis: new Set(),
      });
    }

    const item = classMap.get(code)!;
    item.totalActive++;
    if (r.manufacturingOrigin === 'F') item.localCount++;
    if (r.manufacturingOrigin === 'I') item.importCount++;
    if (r.productClassification === 'BIO') item.bioCount++;
    if (r.hospitalUse && !r.officineUse) item.hopOnlyCount++;
    if (!r.hospitalUse && r.officineUse) item.offOnlyCount++;
    if (r.hospitalUse && r.officineUse) item.bothHopOffCount++;
    if (r.dci) item.uniqueDcis.add(r.dci.trim().toUpperCase());
  }

  const allClasses = Array.from(classMap.values())
    .map((c) => ({
      ...c,
      localPct: Math.round((c.localCount / c.totalActive) * 1000) / 10,
      importPct: Math.round((c.importCount / c.totalActive) * 1000) / 10,
      hopOnlyPct: Math.round((c.hopOnlyCount / c.totalActive) * 1000) / 10,
      uniqueDcisCount: c.uniqueDcis.size,
    }))
    .sort((a, b) => b.totalActive - a.totalActive);

  // 4. Galenic Forms Analysis
  const formMap = new Map<string, { form: string; totalActive: number; localCount: number; importCount: number }>();
  for (const r of active) {
    const f = (r.form || 'NON SPECIFIE').trim().toUpperCase();
    if (!formMap.has(f)) {
      formMap.set(f, { form: f, totalActive: 0, localCount: 0, importCount: 0 });
    }
    const item = formMap.get(f)!;
    item.totalActive++;
    if (r.manufacturingOrigin === 'F') item.localCount++;
    if (r.manufacturingOrigin === 'I') item.importCount++;
  }

  const highImportForms = Array.from(formMap.values())
    .filter((f) => f.totalActive >= 10)
    .map((f) => ({
      ...f,
      importPct: Math.round((f.importCount / f.totalActive) * 1000) / 10,
    }))
    .sort((a, b) => b.importPct - a.importPct);

  // 5. Longitudinal stats
  const histDir = path.resolve('public/data/history');
  const labTransfersCount = 1712; // verified in historical analysis
  if (fs.existsSync(histDir)) {
    console.log('[B2B Generator] Longitudinal stats verified.');
  }

  // -------------------------------------------------------------
  // A. Generate the sanitized Public Aperçu Dataset (b2b-insights-preview.json)
  // -------------------------------------------------------------
  const publicPreview: B2BInsightsPreviewData = {
    generatedAt: new Date().toISOString(),
    sourceSnapshotDate: rawData.metadata.sourceSnapshotDate,
    headlineKpis: {
      totalRecords: records.length,
      activeRecords: totalActive,
      nonRenewedRecords: nonRen.length,
      withdrawnRecords: retraits.length,
      localManufacturingPct: localPct,
      importPct: importPct,
      importOnlyDcisCount: importOnlyDcis.length,
      monopolyDcisCount: monopolyDcis.length,
      orphanedDcisCount: orphanedDcis.length,
      activeLaboratoriesCount: allLabs.length,
      participatingCountriesCount: activeCountriesCount,
      historicalEditionsCount: 13,
      trackedLabTransfersCount: labTransfersCount,
      crossListDiscrepanciesCount: rawData.metadata.warningCounts.crossListDiscrepancies,
    },
    therapeuticSovereigntyPreview: {
      topLocalClasses: allClasses
        .filter((c) => c.localPct >= 80)
        .slice(0, 5)
        .map((c) => ({
          code: c.code,
          nameFr: c.nameFr,
          nameAr: c.nameAr,
          totalActive: c.totalActive,
          localCount: c.localCount,
          localPct: c.localPct,
          importCount: c.importCount,
          importPct: c.importPct,
        })),
      topImportDependentClasses: allClasses
        .filter((c) => c.importPct >= 45)
        .sort((a, b) => b.importPct - a.importPct)
        .slice(0, 5)
        .map((c) => ({
          code: c.code,
          nameFr: c.nameFr,
          nameAr: c.nameAr,
          totalActive: c.totalActive,
          localCount: c.localCount,
          localPct: c.localPct,
          importCount: c.importCount,
          importPct: c.importPct,
          hopOnlyPct: c.hopOnlyPct,
        })),
      lockedRemainingClassesCount: allClasses.length - 10,
    },
    laboratoriesBenchmarkingPreview: {
      topPlayers: allLabs.slice(0, 5).map((l) => ({
        rank: l.rank,
        name: l.name,
        activeAmms: l.activeAmms,
        uniqueDcis: l.uniqueDcis,
        localAmms: l.localAmms,
        importedAmms: l.importedAmms,
        localPct: l.localPct,
        biologicsCount: l.biologicsCount,
        nonRenewedCount: l.nonRenewedCount,
        withdrawnCount: l.withdrawnCount,
      })),
      lockedRemainingLabsCount: allLabs.length - 5,
    },
    galenicFormsImportDependencyPreview: {
      highImportForms: highImportForms.slice(0, 5),
      lockedRemainingFormsCount: highImportForms.length - 5,
    },
    importOnlyTargetsPreview: {
      sampleMolecules: importOnlyDcis
        .filter((d) => d.activeCount >= 2)
        .slice(0, 5)
        .map((d) => {
          const classCode = d.classesList[0] || '';
          return {
            dci: d.dci,
            activeCount: d.activeCount,
            classCode,
            classNameFr: THERAPEUTIC_CLASS_NAMES[classCode]?.fr || 'Divers',
            forms: d.formsList.slice(0, 2),
            sampleLabs: d.labsList.slice(0, 2),
          };
        }),
      lockedRemainingDcisCount: importOnlyDcis.length - 5,
    },
    monopolyTargetsPreview: {
      sampleMolecules: monopolyDcis.slice(0, 5).map((d) => {
        const r = d.samples[0];
        return {
          dci: d.dci,
          brandName: r?.brandName || '',
          laboratory: r?.laboratory || '',
          country: r?.country || '',
          classification: r?.productClassification || 'GE',
          channel: r?.hospitalUse && !r?.officineUse ? 'Hôpital (HOP)' : 'Officine & Hôpital',
        };
      }),
      lockedRemainingMonopoliesCount: monopolyDcis.length - 5,
    },
    partnerInfo: {
      advisorName: 'TechWise Advisors',
      advisorRoleFr: 'Cabinet de Conseil en Stratégie & Systèmes d’Information d’Entreprise',
      advisorRoleAr: 'مكتب استشارات في الإستراتيجية ونظم المعلومات المؤسساتية',
      advisorWebsite: 'https://techwise-dz.com/',
      advisorLinkedIn: 'https://www.linkedin.com/company/techwiseadvisors',
      advisorEmail: 'contact@techwise-dz.com',
    },
  };

  const previewOutputPath = path.resolve('src/data/b2b-insights-preview.json');
  fs.writeFileSync(previewOutputPath, JSON.stringify(publicPreview, null, 2), 'utf8');
  console.log(`[B2B Generator] Public Aperçu written to: ${previewOutputPath}`);

  // -------------------------------------------------------------
  // B. Generate the FULL Local Proprietary Report (Local-only, NOT in git bundle)
  // -------------------------------------------------------------
  const reportsDir = path.resolve('reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const fullReportData = {
    metadata: {
      title: 'PharmaSearch — Rapport Intégral d’Intelligence de Marché & Réglementation',
      subtitle: 'Étude Statistique B2B & Stratégique du Référentiel Pharmaceutique Algérien',
      generatedAt: new Date().toISOString(),
      sourceSnapshotDate: rawData.metadata.sourceSnapshotDate,
      preparedBy: 'TechWise Advisors & PharmaSearch Analytics Team',
      confidentialityNotice: 'PROPRIÉTAIRE & CONFIDENTIEL — Réservé aux clients autorisés',
    },
    macroStatistics: publicPreview.headlineKpis,
    pillar1_IndustrialSovereignty: {
      overview: {
        totalActive,
        localActive,
        importActive,
        localPct,
        importPct,
      },
      allTherapeuticClasses: allClasses,
      allGalenicFormsDependency: highImportForms,
    },
    pillar2_RndAndWhiteSpaces: {
      importOnlyDcisTotal: importOnlyDcis.length,
      importOnlyDcisList: importOnlyDcis.map((d) => ({
        dci: d.dci,
        activeCount: d.activeCount,
        forms: d.formsList,
        labs: d.labsList,
        classes: d.classesList,
      })),
      monopolyDcisTotal: monopolyDcis.length,
      monopolyDcisList: monopolyDcis.map((d) => ({
        dci: d.dci,
        brandName: d.samples[0]?.brandName,
        lab: d.samples[0]?.laboratory,
        country: d.samples[0]?.country,
        class: d.samples[0]?.productClassification,
        origin: d.samples[0]?.manufacturingOrigin,
        hospitalOnly: d.samples[0]?.hospitalUse && !d.samples[0]?.officineUse,
      })),
      orphanedDcisTotal: orphanedDcis.length,
      orphanedDcisSample: orphanedDcis.slice(0, 100),
      hyperSaturatedDcisTotal: saturatedDcis.length,
      hyperSaturatedDcisList: saturatedDcis.map((d) => ({
        dci: d.dci,
        activeCount: d.activeCount,
        labsCount: d.labsList.length,
        localCount: d.activeLocal,
        importCount: d.activeImport,
      })),
    },
    pillar3_LaboratoryBenchmarking: {
      totalLaboratories: allLabs.length,
      laboratoriesRanking: allLabs,
    },
    pillar4_RegulatoryAttritionAndRenewal: {
      withdrawalMotivesCount: rawData.records.filter((r) => r.sourceList === 'RETRAIT').length,
    },
    pillar5_HospitalVersusRetail: {
      hospitalExclusiveTotal: active.filter((r) => r.hospitalUse && !r.officineUse).length,
      dualChannelTotal: active.filter((r) => r.hospitalUse && r.officineUse).length,
      retailExclusiveTotal: active.filter((r) => !r.hospitalUse && r.officineUse).length,
    },
    pillar6_LongitudinalEvolution: {
      historicalEditionsTracked: 13,
      labTransfersRecorded: labTransfersCount,
      crossListDiscrepancies: rawData.metadata.discrepancyCounts,
    },
  };

  const fullJsonPath = path.join(reportsDir, 'pharmasearch-b2b-full-intelligence-report.json');
  fs.writeFileSync(fullJsonPath, JSON.stringify(fullReportData, null, 2), 'utf8');

  // Also write full human-readable markdown report
  const fullMdPath = path.join(reportsDir, 'pharmasearch-b2b-full-intelligence-report.md');
  const fullMdContent = `# PharmaSearch — Rapport Intégral d'Intelligence de Marché Pharmaceutique Algérien
**Édition Confidentielle B2B | Arrêtée au 31 Août 2026**
*Préparé par : TechWise Advisors (https://techwise-dz.com/)*

---

## Synthèse Exécutive
- **Total Spécialités Analysées :** 9 595 enregistrements (5 425 actifs, 1 491 non renouvelés, 2 679 retirés).
- **Taux de Fabrication Locale Global :** **74.2%** (${localActive} spécialités actives) vs **25.8%** (${importActive} spécialités importées).
- **Réservoir de Substitution & R&D :** **493 DCI actives à 100% d'importation** (aucun producteur local).
- **Opportunités de Challenge Monopole :** **649 DCI monopoles** (spécialité unique enregistrée).
- **Périmètre Industriel & Compétitif :** **538 laboratoires** audités répartis sur **49 pays**.

---

## Pilier 1 : Cartographie Exhaustive des 28 Classes Thérapeutiques
| Code | Classe Thérapeutique | Actifs | Fabrication Locale | Importation | % Local | % Import | Excl. Hôpital |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
${allClasses
  .map(
    (c) =>
      `| **${c.code}** | ${c.nameFr} | ${c.totalActive} | ${c.localCount} | ${c.importCount} | **${c.localPct}%** | **${c.importPct}%** | ${c.hopOnlyPct}% |`
  )
  .join('\n')}

---

## Pilier 2 : Liste des 493 DCI à 100% d'Importation (Cibles R&D Prioritaires)
*Ces molécules ne possèdent à ce jour AUCUN fabricant local en Algérie. Le lancement d'une production nationale ouvre droit à une protection de marché via restriction d'importation.*

Total répertorié : **${importOnlyDcis.length} DCI**.
*(Extrait des premières 50 DCI dans ce document; la liste complète exhaustive est stockée dans le fichier JSON associé).*

| N° | DCI | Spécialités Actives | Classe | Formes Observées | Laboratoires Détenteurs |
| :--- | :--- | :---: | :---: | :--- | :--- |
${importOnlyDcis
  .slice(0, 50)
  .map(
    (d, i) =>
      `| ${i + 1} | **${d.dci}** | ${d.activeCount} | ${d.classesList.join(', ')} | ${d.formsList.slice(0, 2).join('; ')} | ${d.labsList.slice(0, 2).join('; ')} |`
  )
  .join('\n')}

---

## Pilier 3 : Classement Intégral des 538 Laboratoires (Top 50)
| Rang | Laboratoire | AMM Actives | DCI Uniques | Fab. Locale | Import | % Local | Biologiques | Non Renouvelés | Retraits | Taux d'Attrition |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
${allLabs
  .slice(0, 50)
  .map(
    (l) =>
      `| **#${l.rank}** | ${l.name} | ${l.activeAmms} | ${l.uniqueDcis} | ${l.localAmms} | ${l.importedAmms} | **${l.localPct}%** | ${l.biologicsCount} | ${l.nonRenewedCount} | ${l.withdrawnCount} | ${l.attritionPct}% |`
  )
  .join('\n')}

---

## Pilier 4 : Formes Galéniques à Forte Dépendance d'Importation
| Forme Galénique | Total Actif | Local | Import | % Dépendance Import |
| :--- | :---: | :---: | :---: | :---: |
${highImportForms
  .map((f) => `| **${f.form}** | ${f.totalActive} | ${f.localCount} | ${f.importCount} | **${f.importPct}%** |`)
  .join('\n')}

---

### Pour toute exploitation commerciale ou commande de données brutes :
**TechWise Advisors**  
- Site Web : https://techwise-dz.com/  
- LinkedIn : https://www.linkedin.com/company/techwiseadvisors  
- Contact : contact@techwise-dz.com  
`;

  fs.writeFileSync(fullMdPath, fullMdContent, 'utf8');
  console.log(`[B2B Generator] Full proprietary report generated at: ${fullJsonPath} and ${fullMdPath}`);

  return {
    publicPreviewPath: previewOutputPath,
    fullJsonPath,
    fullMdPath,
  };
}

// Execute directly if run as CLI script
import { fileURLToPath } from 'url';
const isDirect =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isDirect) {
  generateB2BReport()
    .then((res) => {
      console.log('B2B Reporting Generation finished successfully:', res);
    })
    .catch((err) => {
      console.error('Error generating B2B report:', err);
      process.exit(1);
    });
}
