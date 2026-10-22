import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import fs from 'fs';
import path from 'path';
import {
  SEO_REGISTRY,
  extractUrlKeyFromPath,
  resolveToRecordId,
  getCanonicalPathForRecord,
  getHrefForRecord,
} from '@/utils/seoRegistry';
import { SearchResultCard } from '@/components/search/SearchResultCard';
import { DetailPage } from '@/pages/DetailPage';
import { RouterProvider, useRouter } from '@/router/RouterContext';
import { I18nProvider } from '@/context/I18nContext';
import { FavouritesProvider } from '@/context/FavouritesContext';
import { DataProvider } from '@/context/DataContext';
import type { PharmaceuticalRecord, NomenclatureDataset } from '@/types';

// Minimal mock record for registered and unregistered tests
const registeredRecord: PharmaceuticalRecord = {
  id: 'NOM-4460',
  sourceList: 'NOMENCLATURE_ACTIVE',
  registrationNumber: '602/16 D 175/23',
  code: '16 D 175',
  dci: 'ARIPIPRAZOLE',
  brandName: 'ABILIFY MAINTENA',
  form: 'POUDRE ET SOLVANT POUR SUSP INJ A LIB PROL',
  dosage: '400 MG',
  packaging: 'BOITE DE 01 SERINGUE',
  prescriptionSchedule: 'LISTE I',
  rawPrescriptionSchedule: 'LISTE I',
  hospitalUse: true,
  officineUse: false,
  laboratory: 'H.LUNDBECK A/S',
  country: 'DANEMARK',
  initialRegistrationDate: {
    raw: '20/04/2023',
    isoDate: '2023-04-20',
    formatted: '20/04/2023',
    isInvalidDate: false,
    isAdministrativeTag: false,
  },
  finalRegistrationDate: {
    raw: '20/04/2023',
    isoDate: '2023-04-20',
    formatted: '20/04/2023',
    isInvalidDate: false,
    isAdministrativeTag: false,
  },
  productClassification: 'UNKNOWN',
  manufacturingOrigin: 'I',
  provenance: {
    sourceWorksheet: 'Nomenclature Aout 2026',
    sourceRow: 4460,
    snapshotDate: '2026-08-31',
  },
  discrepancies: [
    {
      targetRecordId: 'RET-12', // Notice: RET-12 is registered in SEO registry!
      targetList: 'RETRAIT',
      overlapType: 'EXACT_MATCH',
      matchingFields: ['brandName'],
      description: 'Correspondance test',
    },
  ],
};

const unregisteredRecord: PharmaceuticalRecord = {
  id: 'NOM-17',
  sourceList: 'NOMENCLATURE_ACTIVE',
  registrationNumber: '352/01 A 003/06/22',
  code: '01 A 003',
  dci: 'CETIRIZINE DICHLORHYDRATE',
  brandName: 'ARTIZ',
  form: 'COMPRIME PELLICULE SECABLE',
  dosage: '10MG',
  packaging: 'B/10',
  prescriptionSchedule: 'LISTE II',
  rawPrescriptionSchedule: 'LISTE II',
  hospitalUse: true,
  officineUse: true,
  laboratory: 'EL KENDI INDUSTRIE DU MEDICAMENT',
  country: 'ALGERIE',
  initialRegistrationDate: {
    raw: '31/07/2006',
    isoDate: '2006-07-31',
    formatted: '31/07/2006',
    isInvalidDate: false,
    isAdministrativeTag: false,
  },
  finalRegistrationDate: {
    raw: '10/08/2025',
    isoDate: '2025-08-10',
    formatted: '10/08/2025',
    isInvalidDate: false,
    isAdministrativeTag: false,
  },
  productClassification: 'GE',
  manufacturingOrigin: 'F',
  provenance: {
    sourceWorksheet: 'Nomenclature Aout 2026',
    sourceRow: 17,
    snapshotDate: '2026-08-31',
  },
};

const mockDataset: NomenclatureDataset = {
  metadata: {
    sourceSnapshotDate: '31 Août 2026',
    officialSourceUrl: 'http://www.industrie-pharmaceutique.gov.dz',
    sourceMinistry: "Ministère de l'Industrie Pharmaceutique",
    sourceDirection: 'Direction de la Régulation',
    generatedAt: '2026-10-21T00:00:00.000Z',
    totalSourceRows: 3,
    listCounts: {
      nomenclatureActive: 2,
      nonRenouveles: 0,
      retraits: 1,
    },
    discrepancyCounts: {
      exactMatches: 1,
      potentialOverlaps: 0,
      intraListDuplicates: 0,
    },
    warningCounts: {
      ambiguousDates: 0,
      missingCriticalFields: 0,
      crossListDiscrepancies: 1,
    },
  },
  records: [
    {
      id: 'NOM-4460',
      sourceList: 'NOMENCLATURE_ACTIVE',
      registrationNumber: '602/16 D 175/23',
      code: '16 D 175',
      dci: 'ARIPIPRAZOLE',
      brandName: 'ABILIFY MAINTENA',
      form: 'POUDRE ET SOLVANT POUR SUSP INJ A LIB PROL',
      dosage: '400 MG',
      packaging: 'BOITE DE 01 SERINGUE',
      prescriptionSchedule: 'LISTE I',
      rawPrescriptionSchedule: 'LISTE I',
      hospitalUse: true,
      officineUse: false,
      laboratory: 'H.LUNDBECK A/S',
      country: 'DANEMARK',
      initialRegistrationDate: {
        raw: '20/04/2023',
        isoDate: '2023-04-20',
        formatted: '20/04/2023',
        isInvalidDate: false,
        isAdministrativeTag: false,
      },
      finalRegistrationDate: {
        raw: '20/04/2023',
        isoDate: '2023-04-20',
        formatted: '20/04/2023',
        isInvalidDate: false,
        isAdministrativeTag: false,
      },
      productClassification: 'UNKNOWN',
      manufacturingOrigin: 'I',
      provenance: {
        sourceWorksheet: 'Nomenclature Aout 2026',
        sourceRow: 4460,
        snapshotDate: '2026-08-31',
      },
      discrepancies: [
        {
          targetRecordId: 'RET-12',
          targetList: 'RETRAIT',
          overlapType: 'EXACT_MATCH',
          matchingFields: ['registrationNumber'],
          description: 'Correspondance avec RET-12',
        },
      ],
    },
    {
      id: 'RET-12',
      sourceList: 'RETRAIT',
      registrationNumber: '156/01 A 001/99',
      code: '01 A 001',
      dci: 'ASTEMIZOLE',
      brandName: 'ASTEMIZOL RATIOPHARM',
      form: 'GLES.',
      dosage: '10MG',
      packaging: 'B/20',
      prescriptionSchedule: 'LISTE II',
      rawPrescriptionSchedule: 'Liste II',
      hospitalUse: true,
      officineUse: true,
      laboratory: 'RATIOPHARM S.A.',
      country: 'ESPAGNE',
      initialRegistrationDate: {
        raw: '31/01/1999',
        isoDate: '1999-01-31',
        formatted: '31/01/1999',
        isInvalidDate: false,
        isAdministrativeTag: false,
      },
      withdrawalDate: {
        raw: '07/03/2009',
        isoDate: '2009-03-07',
        formatted: '07/03/2009',
        isInvalidDate: false,
        isAdministrativeTag: false,
      },
      withdrawalReason: 'RETRAIT PAR LE MSPRH POUR INTERDICTION DU LABORATOIRE',
      productClassification: 'GE',
      manufacturingOrigin: 'I',
      provenance: {
        sourceWorksheet: 'Retraits',
        sourceRow: 12,
        snapshotDate: '2026-08-31',
      },
    },
    unregisteredRecord,
    {
      id: 'NOM-4378',
      sourceList: 'NOMENCLATURE_ACTIVE',
      registrationNumber: '414/16 D 103/08/16',
      code: '16 D 103',
      dci: 'ARIPIPRAZOLE',
      brandName: 'ABILIFY',
      form: 'COMPRIME',
      dosage: '10MG',
      packaging: 'B/28',
      prescriptionSchedule: 'LISTE I',
      rawPrescriptionSchedule: 'LISTE I',
      hospitalUse: true,
      officineUse: true,
      laboratory: 'ABDI IBRAHIM OTSUKA ILAÇ SAN.VE TIC. A.Ş.',
      country: 'TURQUIE',
      initialRegistrationDate: {
        raw: '17/05/2008',
        isoDate: '2008-05-17',
        formatted: '17/05/2008',
        isInvalidDate: false,
        isAdministrativeTag: false,
      },
      finalRegistrationDate: {
        raw: '19/04/2016',
        isoDate: '2016-04-19',
        formatted: '19/04/2016',
        isInvalidDate: false,
        isAdministrativeTag: false,
      },
      shelfLife: '36 MOIS',
      productClassification: 'RE',
      manufacturingOrigin: 'I',
      provenance: {
        sourceWorksheet: 'Nomenclature Aout 2026',
        sourceRow: 4378,
        snapshotDate: '2026-08-31',
      },
    },
    {
      id: 'RET-137',
      sourceList: 'RETRAIT',
      registrationNumber: '188/03 B 005/99',
      code: '03 B 005',
      dci: 'PARACETAMOL',
      brandName: 'PARACETAMOL',
      form: 'COMP.',
      dosage: '500MG',
      packaging: 'B/20',
      prescriptionSchedule: 'NON_SPECIFIE',
      rawPrescriptionSchedule: '',
      hospitalUse: true,
      officineUse: true,
      laboratory: 'LEK',
      country: 'SLOVENIE',
      initialRegistrationDate: {
        raw: '16/03/1999',
        isoDate: '1999-03-16',
        formatted: '16/03/1999',
        isInvalidDate: false,
        isAdministrativeTag: false,
      },
      withdrawalDate: {
        raw: '08/05/2011',
        isoDate: '2011-05-08',
        formatted: '08/05/2011',
        isInvalidDate: false,
        isAdministrativeTag: false,
      },
      withdrawalReason: "RETRAIT PAR LE MSPRH POUR INTERDICTION D'IMPORTATION",
      productClassification: 'GE',
      manufacturingOrigin: 'I',
      provenance: {
        sourceWorksheet: 'Retraits',
        sourceRow: 137,
        snapshotDate: '2026-08-31',
      },
    },
  ],
};

const TestWrapper: React.FC<{ children: React.ReactNode; initialHash?: string }> = ({
  children,
  initialHash = '#/',
}) => {
  if (typeof window !== 'undefined') {
    window.location.hash = initialHash;
  }
  return (
    <RouterProvider>
      <I18nProvider>
        <FavouritesProvider>
          <DataProvider initialDataset={mockDataset}>{children}</DataProvider>
        </FavouritesProvider>
      </I18nProvider>
    </RouterProvider>
  );
};

describe('SEO Phase B & B.1: Clean Medicine URLs, Registry & Internal Links', () => {
  const rootDir = path.resolve(__dirname, '../../');
  const nomenclaturePath = path.join(rootDir, 'public/data/nomenclature.json');
  const distDir = path.join(rootDir, 'dist');

  describe('1. SEO URL Registry & Helper Functions', () => {
    it('contains exactly the 3 valid prototype entries with valid structure', () => {
      expect(SEO_REGISTRY.entries.length).toBe(3);
      const keys = SEO_REGISTRY.entries.map((e) => e.urlKey);
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(3);

      const recordIds = SEO_REGISTRY.entries.map((e) => e.recordId);
      expect(recordIds).toContain('NOM-4460');
      expect(recordIds).toContain('NON-13');
      expect(recordIds).toContain('RET-12');
    });

    it('each registry entry maps to an existing source record in public/data/nomenclature.json', () => {
      const data = JSON.parse(fs.readFileSync(nomenclaturePath, 'utf8'));
      const recordMap = new Map<string, { brandName: string; sourceList: string; registrationNumber: string; code: string }>();
      data.records.forEach((r: { id: string; brandName: string; sourceList: string; registrationNumber: string; code: string }) =>
        recordMap.set(r.id, r)
      );

      expect(data.records.length).toBe(9595);

      for (const entry of SEO_REGISTRY.entries) {
        const record = recordMap.get(entry.recordId);
        expect(record).toBeDefined();
        if (!record) continue;
        expect(record.brandName).toBe(entry.brandName);
        expect(record.sourceList).toBe(entry.sourceList);
        expect(record.registrationNumber).toBe(entry.registrationNumber);
        expect(record.code).toBe(entry.code);

        expect(entry.urlKey).toMatch(/^[a-f0-9]{10}$/);
        expect(entry.fingerprint).toMatch(/^[a-f0-9]{64}$/);
        expect(entry.fingerprint.startsWith(entry.urlKey)).toBe(true);
      }
    });

    it('resolves extractUrlKeyFromPath and resolveToRecordId accurately', () => {
      expect(
        extractUrlKeyFromPath('/medicament/abilify-maintena-400-mg-5f9a078862/')
      ).toBe('5f9a078862');
      expect(
        extractUrlKeyFromPath('/medicament/abilify-maintena-400-mg-5f9a078862')
      ).toBe('5f9a078862');
      expect(extractUrlKeyFromPath('/medicament/5f9a078862')).toBe('5f9a078862');
      expect(extractUrlKeyFromPath('/medicament/')).toBeNull();

      expect(resolveToRecordId('abilify-maintena-400-mg-5f9a078862')).toBe('NOM-4460');
      expect(resolveToRecordId('/medicament/polaramine-5mg-ml-25271e978e/')).toBe('NON-13');
      expect(resolveToRecordId('/medicament/astemizol-ratiopharm-10mg-f82f512d54/')).toBe('RET-12');

      // Legacy fallback
      expect(resolveToRecordId('NOM-4460')).toBe('NOM-4460');
      expect(resolveToRecordId('NOM-3277')).toBe('NOM-3277');
      expect(resolveToRecordId('DOES-NOT-EXIST')).toBe('DOES-NOT-EXIST');
    });

    it('getCanonicalPathForRecord returns clean path for registered records, and null otherwise', () => {
      expect(getCanonicalPathForRecord('NOM-4460')).toBe(
        '/medicament/abilify-maintena-400-mg-5f9a078862/'
      );
      expect(getCanonicalPathForRecord('NON-13')).toBe(
        '/medicament/polaramine-5mg-ml-25271e978e/'
      );
      expect(getCanonicalPathForRecord('RET-12')).toBe(
        '/medicament/astemizol-ratiopharm-10mg-f82f512d54/'
      );
      expect(getCanonicalPathForRecord('NOM-17')).toBeNull();
      expect(getCanonicalPathForRecord('NOM-3277')).toBeNull();
    });

    it('getHrefForRecord returns clean canonical path for registered records, and supported hash URL otherwise', () => {
      expect(getHrefForRecord('NOM-4460')).toBe(
        '/medicament/abilify-maintena-400-mg-5f9a078862/'
      );
      expect(getHrefForRecord('NON-13')).toBe(
        '/medicament/polaramine-5mg-ml-25271e978e/'
      );
      expect(getHrefForRecord('RET-12')).toBe(
        '/medicament/astemizol-ratiopharm-10mg-f82f512d54/'
      );

      // Unregistered records must return hash-based URLs, NOT broken /medicament/NOM-17 clean paths
      expect(getHrefForRecord('NOM-17')).toBe('/#/medicament/NOM-17');
      expect(getHrefForRecord('NOM-3277')).toBe('/#/medicament/NOM-3277');
    });
  });

  describe('2. Internal Navigation & HTML Anchor Elements (Phase B.1)', () => {
    it('SearchResultCard exposes actual <a href> with clean canonical path for registered record', () => {
      render(
        <TestWrapper>
          <SearchResultCard record={registeredRecord} density="standard" />
        </TestWrapper>
      );

      // Check brand link anchor
      const brandLink = screen.getByRole('link', { name: /ABILIFY MAINTENA/i });
      expect(brandLink).toBeInTheDocument();
      expect(brandLink).toHaveAttribute(
        'href',
        '/medicament/abilify-maintena-400-mg-5f9a078862/'
      );

      // Check view details action link
      const detailsLink = screen.getByRole('link', { name: /Consulter la fiche/i });
      expect(detailsLink).toBeInTheDocument();
      expect(detailsLink).toHaveAttribute(
        'href',
        '/medicament/abilify-maintena-400-mg-5f9a078862/'
      );
    });

    it('SearchResultCard uses supported hash href for unregistered records to prevent 404', () => {
      render(
        <TestWrapper>
          <SearchResultCard record={unregisteredRecord} density="standard" />
        </TestWrapper>
      );

      const brandLink = screen.getByRole('link', { name: /ARTIZ/i });
      expect(brandLink).toBeInTheDocument();
      expect(brandLink).toHaveAttribute('href', '/#/medicament/NOM-17');

      const detailsLink = screen.getByRole('link', { name: /Consulter la fiche/i });
      expect(detailsLink).toBeInTheDocument();
      expect(detailsLink).toHaveAttribute('href', '/#/medicament/NOM-17');
    });

    it('SearchResultCard in compact and comfortable modes also renders genuine anchors', () => {
      const { rerender } = render(
        <TestWrapper>
          <SearchResultCard record={registeredRecord} density="compact" />
        </TestWrapper>
      );
      expect(
        screen.getByRole('link', { name: /ABILIFY MAINTENA/i })
      ).toHaveAttribute('href', '/medicament/abilify-maintena-400-mg-5f9a078862/');

      rerender(
        <TestWrapper>
          <SearchResultCard record={registeredRecord} density="comfortable" />
        </TestWrapper>
      );
      expect(
        screen.getByRole('link', { name: /ABILIFY MAINTENA/i })
      ).toHaveAttribute('href', '/medicament/abilify-maintena-400-mg-5f9a078862/');
    });

    it('DetailPage discrepancy link to a registered target uses clean canonical href', async () => {
      const { searchService } = await import('@/services/searchService');
      searchService.initFromDataset(mockDataset);

      render(
        <TestWrapper initialHash="#/medicament/NOM-4460">
          <DetailPage />
        </TestWrapper>
      );

      // RET-12 is registered in the prototype registry
      const compareLink = screen.getByRole('link', {
        name: /Comparer avec cette fiche/i,
      });
      expect(compareLink).toBeInTheDocument();
      expect(compareLink).toHaveAttribute(
        'href',
        '/medicament/astemizol-ratiopharm-10mg-f82f512d54/'
      );
    });
  });

  describe('3. Prerendered Static HTML Verification (dist directory)', () => {
    it('prerenders exactly the 3 configured valid sample pages and 404.html', () => {
      const p1 = path.join(
        distDir,
        'medicament/abilify-maintena-400-mg-5f9a078862/index.html'
      );
      const p2 = path.join(
        distDir,
        'medicament/polaramine-5mg-ml-25271e978e/index.html'
      );
      const p3 = path.join(
        distDir,
        'medicament/astemizol-ratiopharm-10mg-f82f512d54/index.html'
      );
      const notFound = path.join(distDir, '404.html');

      expect(fs.existsSync(p1)).toBe(true);
      expect(fs.existsSync(p2)).toBe(true);
      expect(fs.existsSync(p3)).toBe(true);
      expect(fs.existsSync(notFound)).toBe(true);
    });

    it('NOM-4460 (Active) static HTML has verified fields, active list, and snapshot date before JS', () => {
      const file = path.join(
        distDir,
        'medicament/abilify-maintena-400-mg-5f9a078862/index.html'
      );
      const html = fs.readFileSync(file, 'utf8');

      expect(html).toContain(
        '<title>ABILIFY MAINTENA — 400 MG | PharmaSearch</title>'
      );
      expect(html).toContain(
        '<link rel="canonical" href="https://pharmasearch.indz.net/medicament/abilify-maintena-400-mg-5f9a078862/" />'
      );
      expect(html).toContain(
        '<meta property="og:title" content="ABILIFY MAINTENA — 400 MG | PharmaSearch" />'
      );
      expect(html).toContain(
        '<meta property="og:url" content="https://pharmasearch.indz.net/medicament/abilify-maintena-400-mg-5f9a078862/" />'
      );
      expect(html).toContain(
        '<meta name="twitter:title" content="ABILIFY MAINTENA — 400 MG | PharmaSearch" />'
      );
      expect(html).toContain(
        '<meta property="og:image" content="https://pharmasearch.indz.net/images/og-pharmasearch.png" />'
      );

      expect(html).toContain('ABILIFY MAINTENA');
      expect(html).toContain('ARIPIPRAZOLE');
      expect(html).toContain('602/16 D 175/23');
      expect(html).toContain('16 D 175');
      expect(html).toContain('H.LUNDBECK A/S');
      expect(html).toContain('DANEMARK');
      expect(html).toContain('BOITE DE 01 SERINGUE');
      expect(html).toContain('Classification officielle : Nomenclature active');
      expect(html).toContain('31 Août 2026');
    });

    it('NON-13 (Non Renouvelé) static HTML displays non-renewed status and verified specs', () => {
      const file = path.join(
        distDir,
        'medicament/polaramine-5mg-ml-25271e978e/index.html'
      );
      const html = fs.readFileSync(file, 'utf8');

      expect(html).toContain('<title>POLARAMINE — 5MG/ML | PharmaSearch</title>');
      expect(html).toContain(
        '<link rel="canonical" href="https://pharmasearch.indz.net/medicament/polaramine-5mg-ml-25271e978e/" />'
      );
      expect(html).toContain('POLARAMINE');
      expect(html).toContain('DEXCHLORPHENIRAMINE MALEATE');
      expect(html).toContain('027/01 A 004/97');
      expect(html).toContain('SCHERING PLOUGH');
      expect(html).toContain('Classification officielle : Non renouvelé');
      expect(html).toContain('31 Août 2026');
    });

    it('RET-12 (Retrait) static HTML displays withdrawal status, date, reason, and snapshot', () => {
      const file = path.join(
        distDir,
        'medicament/astemizol-ratiopharm-10mg-f82f512d54/index.html'
      );
      const html = fs.readFileSync(file, 'utf8');

      expect(html).toContain(
        '<title>ASTEMIZOL RATIOPHARM — 10MG | PharmaSearch</title>'
      );
      expect(html).toContain(
        '<link rel="canonical" href="https://pharmasearch.indz.net/medicament/astemizol-ratiopharm-10mg-f82f512d54/" />'
      );
      expect(html).toContain('ASTEMIZOL RATIOPHARM');
      expect(html).toContain('ASTEMIZOLE');
      expect(html).toContain('156/01 A 001/99');
      expect(html).toContain('RATIOPHARM S.A.');
      expect(html).toContain('Classification officielle : Retiré');
      expect(html).toContain('Date de retrait');
      expect(html).toContain('07/03/2009');
      expect(html).toContain('RETRAIT PAR LE MSPRH POUR INTERDICTION DU LABORATOIRE');
      expect(html).toContain('31 Août 2026');
    });

    it('404.html static response contains noindex directive and helpful error content', () => {
      const notFound = path.join(distDir, '404.html');
      const html = fs.readFileSync(notFound, 'utf8');

      expect(html).toContain(
        '<title>Produit ou page introuvable | PharmaSearch</title>'
      );
      expect(html).toContain(
        '<meta name="robots" content="noindex, nofollow" />'
      );
      expect(html).toContain('404 — Produit ou référence introuvable');
      expect(html).toContain('Retour au registre national');
    });
  });

  describe('4. Routing Normalization & Hash Defect Regression Tests', () => {
    it('normalizes malformed double-hash #/#/medicament/NOM-4378 so DetailPage displays ABILIFY', async () => {
      const { searchService } = await import('@/services/searchService');
      searchService.initFromDataset(mockDataset);

      render(
        <TestWrapper initialHash="#/#/medicament/NOM-4378">
          <DetailPage />
        </TestWrapper>
      );

      // Must display the ABILIFY title and details without falling into not-found
      expect(screen.getByRole('heading', { name: 'ABILIFY', level: 1 })).toBeInTheDocument();
      expect(screen.queryByText(/Page introuvable/i)).toBeNull();
      expect(screen.queryByText(/Médicament non trouvé/i)).toBeNull();
    });

    it('normalizes malformed double-hash #/#/medicament/RET-137 so DetailPage displays PARACETAMOL', async () => {
      const { searchService } = await import('@/services/searchService');
      searchService.initFromDataset(mockDataset);

      render(
        <TestWrapper initialHash="#/#/medicament/RET-137">
          <DetailPage />
        </TestWrapper>
      );

      // Must display the PARACETAMOL title and withdrawal classification
      expect(screen.getByRole('heading', { name: 'PARACETAMOL', level: 1 })).toBeInTheDocument();
      expect(screen.getByText(/Retiré/i)).toBeInTheDocument();
      expect(screen.queryByText(/Page introuvable/i)).toBeNull();
    });

    it('navigate normalizes /#/medicament/NOM-4378 to single hash #/medicament/NOM-4378 without double hash', () => {
      let navFn: (to: string) => void = () => {};

      const TestNavigator: React.FC = () => {
        const { navigate } = useRouter();
        navFn = navigate;
        return null;
      };

      render(
        <TestWrapper initialHash="#/">
          <TestNavigator />
        </TestWrapper>
      );

      act(() => {
        navFn('/#/medicament/NOM-4378');
      });
      expect(window.location.hash).toBe('#/medicament/NOM-4378');
      expect(window.location.hash).not.toContain('#/#');

      act(() => {
        navFn('medicament/RET-137');
      });
      expect(window.location.hash).toBe('#/medicament/RET-137');
      expect(window.location.hash).not.toContain('#/#');
    });

    it('navigate with clean canonical path upgrades URL without hash, while legacy /#/ normalizes to single hash', () => {
      let navFn: (to: string) => void = () => {};

      const TestNavigator: React.FC = () => {
        const { navigate } = useRouter();
        navFn = navigate;
        return null;
      };

      render(
        <TestWrapper initialHash="#/">
          <TestNavigator />
        </TestWrapper>
      );

      // Clean canonical path (returned by getHrefForRecord for registered records)
      act(() => {
        navFn(getHrefForRecord('NOM-4460'));
      });
      expect(window.location.pathname).toBe(
        '/medicament/abilify-maintena-400-mg-5f9a078862/'
      );

      // Legacy unregistered route normalizes to single hash
      act(() => {
        navFn('/#/medicament/NOM-4378');
      });
      expect(window.location.hash).toBe('#/medicament/NOM-4378');
      expect(window.location.hash).not.toContain('#/#');
    });

    it('cleans up malformed #/#/ in browser hash on mount via history.replaceState', () => {
      window.location.hash = '#/#/medicament/RET-137';

      render(
        <TestWrapper initialHash="#/#/medicament/RET-137">
          <div data-testid="mounted" />
        </TestWrapper>
      );

      expect(window.location.hash).toBe('#/medicament/RET-137');
      expect(window.location.hash).not.toContain('#/#');
    });
  });
});
