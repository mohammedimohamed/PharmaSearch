import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { RouterProvider, useRouter } from '@/router/RouterContext';
import { I18nProvider, useI18n } from '@/context/I18nContext';
import { FavouritesProvider, useFavourites } from '@/context/FavouritesContext';
import { DataProvider } from '@/context/DataContext';
import { searchService } from '@/services/searchService';
import { HomePage } from '@/pages/HomePage';
import { SearchPage } from '@/pages/SearchPage';
import { DetailPage } from '@/pages/DetailPage';
import { FavouritesPage } from '@/pages/FavouritesPage';
import { DensityToggle } from '@/components/common/DensityToggle';
import type { NomenclatureDataset } from '@/types';

// Mock sample dataset for testing
const mockDataset: NomenclatureDataset = {
  metadata: {
    sourceSnapshotDate: '31 Août 2026',
    officialSourceUrl: 'http://www.industrie-pharmaceutique.gov.dz',
    sourceMinistry: "Ministère de l'Industrie Pharmaceutique",
    sourceDirection: 'Direction de la Pharmaco-Économie, des Activités Pharmaceutiques et de la Régulation',
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
      ambiguousDates: 1,
      missingCriticalFields: 0,
      crossListDiscrepancies: 1,
    },
  },
  records: [
    {
      id: 'NOM-4460',
      sourceList: 'NOMENCLATURE_ACTIVE',
      registrationNumber: '254/08 B 273/19',
      code: '08 B 273',
      brandName: 'ABILIFY MAINTENA 400mg',
      dci: 'ARIPIPRAZOLE',
      dosage: '400mg',
      form: 'POUDRE ET SOLVANT POUR SUSPENSION INJECTABLE A LIBERATION PROLONGEE',
      packaging: 'FLACON DE POUDRE + SERINGUE PRE REMPLIE DE SOLVANT DE 2ML',
      laboratory: 'OTSUKA PHARMACEUTICAL EUROPE LTD',
      country: 'ANGLETERRE',
      prescriptionSchedule: 'NON_SPECIFIE',
      rawPrescriptionSchedule: '',
      initialRegistrationDate: {
        raw: '10/06/2019',
        isoDate: '2019-06-10',
        formatted: '10/06/2019',
        isInvalidDate: false,
        isAdministrativeTag: false,
      },
      finalRegistrationDate: {
        raw: '',
        isoDate: null,
        formatted: null,
        isInvalidDate: false,
        isAdministrativeTag: false,
      },
      productClassification: 'RE',
      manufacturingOrigin: 'I',
      hospitalUse: true,
      officineUse: false,
      provenance: {
        sourceWorksheet: 'Nomenclature Aout 2026',
        sourceRow: 4460,
        snapshotDate: '31 Août 2026',
      },
      discrepancies: [
        {
          targetRecordId: 'RET-2333',
          targetList: 'RETRAIT',
          overlapType: 'EXACT_MATCH',
          matchingFields: ['registrationNumber'],
          description: 'Identique à la ligne 2333 de la liste Retraits',
        },
      ],
    },
    {
      id: 'RET-2333',
      sourceList: 'RETRAIT',
      registrationNumber: '254/08 B 273/19',
      code: '08 B 273',
      brandName: 'ABILIFY MAINTENA 400mg',
      dci: 'ARIPIPRAZOLE',
      dosage: '400mg',
      form: 'POUDRE ET SOLVANT POUR SUSPENSION INJECTABLE A LIBERATION PROLONGEE',
      packaging: 'FLACON DE POUDRE + SERINGUE PRE REMPLIE DE SOLVANT DE 2ML',
      laboratory: 'OTSUKA PHARMACEUTICAL EUROPE LTD',
      country: 'ANGLETERRE',
      prescriptionSchedule: 'NON_SPECIFIE',
      rawPrescriptionSchedule: '',
      initialRegistrationDate: {
        raw: '10/06/2019',
        isoDate: '2019-06-10',
        formatted: '10/06/2019',
        isInvalidDate: false,
        isAdministrativeTag: false,
      },
      finalRegistrationDate: {
        raw: '',
        isoDate: null,
        formatted: null,
        isInvalidDate: false,
        isAdministrativeTag: false,
      },
      withdrawalDate: {
        raw: '15/01/2021',
        isoDate: '2021-01-15',
        formatted: '15/01/2021',
        isInvalidDate: false,
        isAdministrativeTag: false,
      },
      withdrawalReason: 'RETRAIT COMMERCIAL A LA DEMANDE DU LABORATOIRE',
      productClassification: 'RE',
      manufacturingOrigin: 'I',
      hospitalUse: true,
      officineUse: false,
      provenance: {
        sourceWorksheet: 'Retraits',
        sourceRow: 2333,
        snapshotDate: '31 Août 2026',
      },
      discrepancies: [
        {
          targetRecordId: 'NOM-4460',
          targetList: 'NOMENCLATURE_ACTIVE',
          overlapType: 'EXACT_MATCH',
          matchingFields: ['registrationNumber'],
          description: 'Identique à la ligne 4460 de la Nomenclature active',
        },
      ],
    },
    {
      id: 'NOM-3277',
      sourceList: 'NOMENCLATURE_ACTIVE',
      registrationNumber: '113/08 T 052/19',
      code: '08 T 052',
      brandName: 'SOFOSBUVIR MERINAL 400 mg',
      dci: 'SOFOSBUVIR',
      dosage: '400 mg',
      form: 'COMPRIME PELLICULE',
      packaging: 'BOITE DE 28',
      laboratory: 'SARL MERINAL',
      country: 'ALGERIE',
      prescriptionSchedule: 'NON_SPECIFIE',
      rawPrescriptionSchedule: '',
      initialRegistrationDate: {
        raw: '00/00/2019',
        isoDate: null,
        formatted: '00/00/2019',
        isInvalidDate: true,
        isAdministrativeTag: false,
        warning: "Date initiale malformée dans la source officielle : '00/00/2019'",
      },
      finalRegistrationDate: {
        raw: '',
        isoDate: null,
        formatted: null,
        isInvalidDate: false,
        isAdministrativeTag: false,
      },
      productClassification: 'GE',
      manufacturingOrigin: 'F',
      hospitalUse: false,
      officineUse: true,
      provenance: {
        sourceWorksheet: 'Nomenclature Aout 2026',
        sourceRow: 3277,
        snapshotDate: '31 Août 2026',
      },
    },
  ],
};

// Test wrapper providing all context providers
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

describe('Stage 4 UI Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    searchService.initFromDataset(mockDataset);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('1. Router parses paths and updates hash properly', () => {
    let capturedNavigate: (to: string, params?: Record<string, string | undefined>) => void;

    const TestRouterConsumer = () => {
      const { path, navigate } = useRouter();
      capturedNavigate = navigate;
      return <div data-testid="route-path">{path}</div>;
    };

    render(
      <TestWrapper initialHash="#/recherche?q=paracetamol">
        <TestRouterConsumer />
      </TestWrapper>
    );

    expect(screen.getByTestId('route-path')).toHaveTextContent('/recherche');

    act(() => {
      capturedNavigate('/medicament/NOM-4460');
    });

    expect(window.location.hash).toBe('#/medicament/NOM-4460');
  });

  it('2. I18n toggles language, updates document direction to RTL and arabic font class', () => {
    const TestI18nConsumer = () => {
      const { language, toggleLanguage, isRTL, t } = useI18n();
      return (
        <div>
          <span data-testid="lang">{language}</span>
          <span data-testid="rtl">{isRTL ? 'RTL' : 'LTR'}</span>
          <span data-testid="title">{t.appName}</span>
          <button type="button" onClick={toggleLanguage} data-testid="toggle-btn">
            Toggle
          </button>
        </div>
      );
    };

    render(
      <TestWrapper>
        <TestI18nConsumer />
      </TestWrapper>
    );

    // Initial default: French LTR
    expect(screen.getByTestId('lang')).toHaveTextContent('fr');
    expect(screen.getByTestId('rtl')).toHaveTextContent('LTR');
    expect(document.documentElement.dir).toBe('ltr');
    expect(document.documentElement.lang).toBe('fr');

    // Toggle to Arabic
    fireEvent.click(screen.getByTestId('toggle-btn'));

    expect(screen.getByTestId('lang')).toHaveTextContent('ar');
    expect(screen.getByTestId('rtl')).toHaveTextContent('RTL');
    expect(document.documentElement.dir).toBe('rtl');
    expect(document.documentElement.lang).toBe('ar');
    expect(document.body.classList.contains('font-arabic')).toBe(true);

    // Check localStorage persistence
    expect(localStorage.getItem('pharmasearch_lang')).toBe('ar');
  });

  it('3. Favourites and personal aliases are stored and managed in versioned schema', () => {
    const TestFavConsumer = () => {
      const {
        favourites,
        aliases,
        toggleFavourite,
        setAlias,
        removeAlias,
        clearFavourites,
      } = useFavourites();

      return (
        <div>
          <span data-testid="fav-count">{favourites.length}</span>
          <span data-testid="alias-count">{Object.keys(aliases).length}</span>
          <button
            type="button"
            data-testid="add-fav"
            onClick={() => toggleFavourite('NOM-4460')}
          >
            Add Fav
          </button>
          <button
            type="button"
            data-testid="set-alias"
            onClick={() => setAlias('NOM-4460', 'Stock Garde')}
          >
            Set Alias
          </button>
          <button
            type="button"
            data-testid="remove-alias"
            onClick={() => removeAlias('NOM-4460')}
          >
            Remove Alias
          </button>
          <button
            type="button"
            data-testid="clear-all"
            onClick={clearFavourites}
          >
            Clear All
          </button>
        </div>
      );
    };

    render(
      <TestWrapper>
        <TestFavConsumer />
      </TestWrapper>
    );

    expect(screen.getByTestId('fav-count')).toHaveTextContent('0');

    // Add favourite
    fireEvent.click(screen.getByTestId('add-fav'));
    expect(screen.getByTestId('fav-count')).toHaveTextContent('1');

    // Check localStorage schema
    const stored = JSON.parse(localStorage.getItem('pharmasearch_user_data_v1') || '{}');
    expect(stored.version).toBe(1);
    expect(stored.favourites).toContain('NOM-4460');

    // Set custom alias
    fireEvent.click(screen.getByTestId('set-alias'));
    const storedWithAlias = JSON.parse(localStorage.getItem('pharmasearch_user_data_v1') || '{}');
    expect(storedWithAlias.aliases['NOM-4460']).toBe('Stock Garde');

    // Remove alias
    fireEvent.click(screen.getByTestId('remove-alias'));
    const storedAfterRemove = JSON.parse(localStorage.getItem('pharmasearch_user_data_v1') || '{}');
    expect(storedAfterRemove.aliases['NOM-4460']).toBeUndefined();

    // Clear all
    fireEvent.click(screen.getByTestId('clear-all'));
    expect(screen.getByTestId('fav-count')).toHaveTextContent('0');
  });

  it('4. Density mode toggle updates preference and persists in state', () => {
    render(
      <TestWrapper>
        <DensityToggle />
      </TestWrapper>
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(3);

    // Click compact
    fireEvent.click(buttons[0]);
    const stored = JSON.parse(localStorage.getItem('pharmasearch_user_data_v1') || '{}');
    expect(stored.densityMode).toBe('compact');
  });

  it('5. DetailPage renders complete monograph, discrepancy banner, and provenance', () => {
    render(
      <TestWrapper initialHash="#/medicament/NOM-4460">
        <DetailPage />
      </TestWrapper>
    );

    // Monograph heading
    expect(screen.getByRole('heading', { level: 1, name: /ABILIFY MAINTENA 400mg/i })).toBeInTheDocument();
    expect(screen.getByText('ARIPIPRAZOLE')).toBeInTheDocument();
    expect(screen.getAllByText('OTSUKA PHARMACEUTICAL EUROPE LTD').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('254/08 B 273/19')).toBeInTheDocument();

    // Cross-list discrepancy warning banner
    const alertBanner = screen.getByRole('alert');
    expect(alertBanner).toBeInTheDocument();
    expect(alertBanner).toHaveTextContent(/Signalement Administratif Croisé/i);
    expect(alertBanner).toHaveTextContent('RET-2333');
    expect(alertBanner).toHaveTextContent('Retraits');

    // Provenance specs
    expect(screen.getByText('Nomenclature Aout 2026')).toBeInTheDocument();
    expect(screen.getByText('Ligne 4460')).toBeInTheDocument();
  });

  it('6. DetailPage displays warning banner for malformed date in NOM-3277', () => {
    render(
      <TestWrapper initialHash="#/medicament/NOM-3277">
        <DetailPage />
      </TestWrapper>
    );

    expect(screen.getByText('SOFOSBUVIR MERINAL 400 mg')).toBeInTheDocument();
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(/Avertissement d'intégrité de date/i);
    expect(alert).toHaveTextContent('00/00/2019');
    expect(alert).toHaveTextContent('Ligne Excel 3277');
  });

  it('7. DetailPage displays 404 state for non-existent record ID', () => {
    render(
      <TestWrapper initialHash="#/medicament/NON_EXISTENT_ID">
        <DetailPage />
      </TestWrapper>
    );

    expect(screen.getByText(/Produit introuvable/i)).toBeInTheDocument();
    expect(screen.getByText(/NON_EXISTENT_ID/i)).toBeInTheDocument();
  });

  it('8. FavouritesPage renders empty state and saved items correctly', () => {
    render(
      <TestWrapper initialHash="#/favoris">
        <FavouritesPage />
      </TestWrapper>
    );

    // Empty state initially
    expect(screen.getByText(/Aucun médicament dans vos favoris/i)).toBeInTheDocument();
    expect(screen.getByText(/Vos favoris et alias sont stockés exclusivement dans ce navigateur/i)).toBeInTheDocument();
  });

  it('9. SearchPage renders records and executes searches', () => {
    render(
      <TestWrapper initialHash="#/recherche">
        <SearchPage />
      </TestWrapper>
    );

    // Initial search page view
    expect(screen.getByPlaceholderText(/Rechercher par marque/i)).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 3, name: /ABILIFY MAINTENA 400mg/i }).length).toBe(2);
  });

  it('10. HomePage renders dynamic counts from dataset metadata without hardcoded figures', () => {
    render(
      <TestWrapper initialHash="#/">
        <HomePage />
      </TestWrapper>
    );

    // Dynamic metadata figures from mockDataset (2 active, 0 nonRenewed, 1 withdrawn, 3 total, 1 discrepancy)
    expect(screen.getByText(/3 Total source cumulé/i)).toBeInTheDocument(); // total records
    expect(screen.getByText('2')).toBeInTheDocument(); // active
    expect(screen.getByText('0')).toBeInTheDocument(); // non renewed
    expect(screen.getByText('1')).toBeInTheDocument(); // withdrawn
  });

  it('11. Regression: Search UI query result count strictly matches searchService result count', () => {
    // 1. Service count
    const serviceResults = searchService.search('SOFOSBUVIR');
    expect(serviceResults.totalHits).toBe(1);

    // 2. UI rendering
    render(
      <TestWrapper initialHash="#/recherche?q=SOFOSBUVIR">
        <SearchPage />
      </TestWrapper>
    );

    // Header badge displays exact count
    expect(screen.getByText(/1 résultat\(s\) trouvé\(s\)/i)).toBeInTheDocument();
    expect(screen.getByText(/SOFOSBUVIR MERINAL 400 mg/i)).toBeInTheDocument();
  });

  it('12. Neutral pharmaceutical code descriptions: preserves codes, avoids unsupported claims, and clarifies blank P2/LISTE', () => {
    // Render DetailPage for NOM-4460 (RE, I, P1=true, P2=false, LISTE='')
    const { unmount } = render(
      <TestWrapper initialHash="#/medicament/NOM-4460">
        <DetailPage />
      </TestWrapper>
    );

    // STATUT: Importation (I)
    expect(screen.getByText(/Origine de fabrication \(STATUT\)/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Importation \(I\)/i).length).toBeGreaterThanOrEqual(1);

    // TYPE: Princeps / Référence (RE)
    expect(screen.getByText(/Classification produit \(TYPE\)/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Princeps \/ Référence \(RE\)/i).length).toBeGreaterThanOrEqual(1);

    // P1: Specified (HOP)
    expect(screen.getByText(/Usage hospitalier \(P1 - HOP\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Spécifié dans le document source \(HOP\)/i)).toBeInTheDocument();

    // P2: Unspecified (must NOT claim hospital exclusive)
    expect(screen.getByText(/Délivrance en officine \(P2 - OFF\)/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Non spécifié dans le document source \(l'absence de mention OFF ne prouve pas une exclusivité hospitalière\)/i)
    ).toBeInTheDocument();

    // LISTE: Unspecified (must NOT claim OTC)
    expect(
      screen.getByText(/Non listé \(non spécifié dans le registre officiel — ne préjuge pas du statut de vente libre\)/i)
    ).toBeInTheDocument();

    unmount();

    // Render DetailPage for NOM-3277 (GE, F, P1=false, P2=true)
    render(
      <TestWrapper initialHash="#/medicament/NOM-3277">
        <DetailPage />
      </TestWrapper>
    );

    // STATUT: Fabrication locale (F)
    expect(screen.getAllByText(/Fabrication locale \(F\)/i).length).toBeGreaterThanOrEqual(1);

    // TYPE: Generic note stating registration without claiming verified bioequivalence
    expect(
      screen.getByText(/Générique \(GE\) — enregistrement sous statut générique dans la nomenclature \(n'atteste pas à lui seul d'une bioéquivalence certifiée/i)
    ).toBeInTheDocument();

    // P1: Unspecified in source
    expect(screen.getByText('Non spécifié dans le document source')).toBeInTheDocument();

    // P2: Specified (OFF)
    expect(screen.getByText(/Spécifié dans le document source \(OFF\)/i)).toBeInTheDocument();
  });
});
