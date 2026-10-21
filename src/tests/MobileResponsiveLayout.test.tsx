import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { RouterProvider } from '@/router/RouterContext';
import { I18nProvider } from '@/context/I18nContext';
import { FavouritesProvider } from '@/context/FavouritesContext';
import { DataProvider } from '@/context/DataContext';
import { DensityToggle } from '@/components/common/DensityToggle';
import { Pagination } from '@/components/common/Pagination';
import { SearchResultCard } from '@/components/search/SearchResultCard';
import { SearchPage } from '@/pages/SearchPage';
import type { PharmaceuticalRecord } from '@/types';

const mockRecord: PharmaceuticalRecord = {
  id: 'NOM-100',
  brandName: 'SAIDAL PARACETAMOL EXTRA LONG BRAND NAME EXTENSION FOR TESTING',
  dci: 'PARACETAMOL / CODEINE PHOSPHATE HEMIHYDRATE',
  dosage: '500MG/30MG',
  form: 'COMPRIME EFFERVESCENT',
  packaging: 'BOITE DE 16 COMPRIMES EN TUBE ALUMINIUM',
  laboratory: 'LABORATOIRES SAIDAL GROUPE INDUSTRIEL PHARMACEUTIQUE',
  country: 'ALGERIE',
  code: '01 A 003',
  prescriptionSchedule: 'NON_SPECIFIE',
  rawPrescriptionSchedule: '',
  registrationNumber: '352/01 A 003/06/22 (RENOUVELLEMENT VINGT-DEUXIEME EDITION)',
  initialRegistrationDate: {
    raw: '12/04/2006',
    formatted: '12/04/2006',
    isoDate: '2006-04-12',
    isInvalidDate: false,
    isAdministrativeTag: false,
  },
  sourceList: 'NOMENCLATURE_ACTIVE',
  productClassification: 'GE',
  manufacturingOrigin: 'F',
  hospitalUse: false,
  officineUse: true,
  provenance: {
    sourceWorksheet: 'Nomenclature Aout 2026',
    sourceRow: 100,
    snapshotDate: '31/08/2026',
  },
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RouterProvider>
    <I18nProvider>
      <FavouritesProvider>
        <DataProvider>{children}</DataProvider>
      </FavouritesProvider>
    </I18nProvider>
  </RouterProvider>
);

describe('Mobile Responsive Layout & Viewport Regression Tests', () => {
  it('1. DensityToggle renders all 3 options accessible with aria-pressed and labels', () => {
    render(
      <TestWrapper>
        <DensityToggle />
      </TestWrapper>
    );

    const group = screen.getByRole('group');
    expect(group).toBeInTheDocument();

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);

    // Initial default is standard
    expect(buttons[0]).toHaveAttribute('aria-pressed', 'false');
    expect(buttons[1]).toHaveAttribute('aria-pressed', 'true');
    expect(buttons[2]).toHaveAttribute('aria-pressed', 'false');

    // All buttons have accessible titles / aria-labels
    expect(buttons[0]).toHaveAttribute('aria-label');
    expect(buttons[1]).toHaveAttribute('aria-label');
    expect(buttons[2]).toHaveAttribute('aria-label');

    // Clicking switches active button
    fireEvent.click(buttons[0]);
    expect(buttons[0]).toHaveAttribute('aria-pressed', 'true');
    expect(buttons[1]).toHaveAttribute('aria-pressed', 'false');
  });

  it('2. Pagination renders both mobile compact indicator and desktop controls', () => {
    const handlePageChange = vi.fn();
    const { container } = render(
      <TestWrapper>
        <Pagination
          currentPage={3}
          totalPages={15}
          totalHits={300}
          pageSize={20}
          onPageChange={handlePageChange}
        />
      </TestWrapper>
    );

    // Mobile indicator exists
    const mobileIndicator = container.querySelector('.sm\\:hidden');
    expect(mobileIndicator).toBeInTheDocument();
    expect(mobileIndicator?.textContent).toContain('3');
    expect(mobileIndicator?.textContent).toContain('15');

    // Desktop page sequence container exists with hidden sm:flex
    const desktopPages = container.querySelector('.hidden.sm\\:flex');
    expect(desktopPages).toBeInTheDocument();

    // Previous and next buttons
    const prevBtn = screen.getByLabelText(/précédent|السابق/i);
    const nextBtn = screen.getByLabelText(/suivant|التالي/i);
    expect(prevBtn).toBeInTheDocument();
    expect(nextBtn).toBeInTheDocument();

    fireEvent.click(prevBtn);
    expect(handlePageChange).toHaveBeenCalledWith(2);

    fireEvent.click(nextBtn);
    expect(handlePageChange).toHaveBeenCalledWith(4);
  });

  it('3. SearchResultCard includes text wrapping and truncation protection classes', () => {
    const { container: standardContainer } = render(
      <TestWrapper>
        <SearchResultCard record={mockRecord} density="standard" />
      </TestWrapper>
    );
    expect(standardContainer.querySelector('.break-words')).toBeInTheDocument();
    expect(standardContainer.querySelector('.truncate')).toBeInTheDocument();

    const { container: compactContainer } = render(
      <TestWrapper>
        <SearchResultCard record={mockRecord} density="compact" />
      </TestWrapper>
    );
    expect(compactContainer.querySelector('.truncate')).toBeInTheDocument();

    const { container: comfortableContainer } = render(
      <TestWrapper>
        <SearchResultCard record={mockRecord} density="comfortable" />
      </TestWrapper>
    );
    expect(comfortableContainer.querySelector('.break-words')).toBeInTheDocument();
  });

  it('4. SearchPage toolbar includes responsive wrapping layout classes', () => {
    const { container } = render(
      <TestWrapper>
        <SearchPage />
      </TestWrapper>
    );

    // Toolbar wrapper has responsive flex directions (flex-col on mobile, sm:flex-row on tablet/desktop)
    const toolbar = container.querySelector('.flex.flex-col.sm\\:flex-row');
    expect(toolbar).toBeInTheDocument();

    // Filter button is available on mobile and hidden on desktop (lg:hidden)
    const mobileFilterBtn = screen.getByRole('button', { name: /filtres|تصفية/i });
    expect(mobileFilterBtn).toHaveClass('lg:hidden');

    // Sort selector has flexible truncation container
    const sortSelect = screen.getByRole('combobox');
    expect(sortSelect).toBeInTheDocument();
    expect(sortSelect).toHaveClass('truncate');
  });
});
