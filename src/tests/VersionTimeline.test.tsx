import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { VersionTimeline } from '../components/detail/VersionTimeline';
import { I18nProvider } from '../context/I18nContext';
import { MedicineHistoryItem } from '../types/pharmaceutical';

const mockHistoryData: MedicineHistoryItem = {
  recordId: 'NOM-101',
  registrationNumber: '123/45 A 678/22',
  firstSeenEdition: 'Août 2024',
  lastSeenEdition: 'Août 2026',
  annualNewGrantYear: 2022,
  events: [
    {
      editionId: 'INIT',
      editionLabel: 'Enregistrement Initial',
      editionDate: '2022-05-10',
      type: 'INITIAL_REGISTRATION',
      sourceList: 'NOMENCLATURE_ACTIVE',
      badgeLabelFr: 'Décision Initiale',
      badgeLabelAr: 'القرار الأولي',
      titleFr: 'Autorisation initiale de mise sur le marché',
      titleAr: 'الترخيص الأولي لطرح الدواء في السوق',
      details: {
        'Laboratoire': 'SAIDAL',
      },
    },
    {
      editionId: '2025-06',
      editionLabel: 'Juin 2025',
      editionDate: '2025-06-30',
      type: 'FIELD_MODIFICATION',
      sourceList: 'NOMENCLATURE_ACTIVE',
      badgeLabelFr: 'Modification',
      badgeLabelAr: 'تعديل',
      titleFr: 'Changement de laboratoire détenteur',
      titleAr: 'تعديل المخبر الحائز',
      changes: [
        {
          field: 'laboratory',
          oldValue: 'EL KENDI',
          newValue: 'EL KENDI INDUSTRIE DU MEDICAMENT',
          labelFr: 'Laboratoire détenteur',
          labelAr: 'المخبر الحائز على التسجيل',
        },
      ],
    },
    {
      editionId: '2026-08',
      editionLabel: 'Août 2026 (Actuel)',
      editionDate: '2026-08-31',
      type: 'CONFIRMED',
      sourceList: 'NOMENCLATURE_ACTIVE',
      badgeLabelFr: 'Actif au 31/08/2026',
      badgeLabelAr: 'سارٍ حتى 31/08/2026',
      titleFr: 'Situation administrative arrêtée au 31 Août 2026',
      titleAr: 'الوضعية الإدارية المعتمدة حتى 31 أوت 2026',
    },
  ],
};

describe('VersionTimeline Component', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) => {
        if (url.includes('NOM-101')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve(mockHistoryData),
          });
        }
        return Promise.resolve({
          ok: false,
          status: 404,
          json: () => Promise.reject(new Error('Not found')),
        });
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading state initially and then renders timeline events and diffs', async () => {
    render(
      <I18nProvider>
        <VersionTimeline recordId="NOM-101" />
      </I18nProvider>
    );

    // After async fetch completes, title and events should appear
    await waitFor(() => {
      expect(screen.getByText('Évolution & Historique des Nomenclatures')).toBeInTheDocument();
    });

    expect(screen.getByText('Enregistrement Initial')).toBeInTheDocument();
    expect(screen.getByText('Juin 2025')).toBeInTheDocument();
    expect(screen.getByText('EL KENDI')).toBeInTheDocument();
    expect(screen.getByText('EL KENDI INDUSTRIE DU MEDICAMENT')).toBeInTheDocument();
    expect(screen.getByText('Août 2026 (Actuel)')).toBeInTheDocument();
  });

  it('handles not-found history gracefully with user friendly message', async () => {
    render(
      <I18nProvider>
        <VersionTimeline recordId="UNKNOWN-999" />
      </I18nProvider>
    );

    await waitFor(() => {
      expect(
        screen.getByText('Impossible de charger l’historique des versions officielles.')
      ).toBeInTheDocument();
    });
  });
});
