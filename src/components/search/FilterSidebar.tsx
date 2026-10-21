import React, { useState } from 'react';
import type { SourceListType, ProductClassification, ManufacturingOrigin } from '@/types';
import type { SearchFilterOptions, FilterFacets } from '@/services/searchService';
import { useI18n } from '@/context/I18nContext';
import { cn } from '@/utils/cn';

interface FilterSidebarProps {
  filters: SearchFilterOptions;
  facets: FilterFacets | null;
  onFilterChange: (newFilters: SearchFilterOptions) => void;
  onReset: () => void;
  className?: string;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  facets,
  onFilterChange,
  onReset,
  className,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const { t } = useI18n();
  const [showAllForms, setShowAllForms] = useState(false);
  const [showAllLabs, setShowAllLabs] = useState(false);

  // Helper toggle functions
  const toggleSourceList = (val: SourceListType) => {
    const current = filters.sourceList || [];
    const next = current.includes(val) ? current.filter((x) => x !== val) : [...current, val];
    onFilterChange({ ...filters, sourceList: next.length > 0 ? next : undefined });
  };

  const toggleClassification = (val: ProductClassification) => {
    const current = filters.productClassification || [];
    const next = current.includes(val) ? current.filter((x) => x !== val) : [...current, val];
    onFilterChange({ ...filters, productClassification: next.length > 0 ? next : undefined });
  };

  const toggleOrigin = (val: ManufacturingOrigin) => {
    const current = filters.manufacturingOrigin || [];
    const next = current.includes(val) ? current.filter((x) => x !== val) : [...current, val];
    onFilterChange({ ...filters, manufacturingOrigin: next.length > 0 ? next : undefined });
  };

  const toggleHospital = () => {
    onFilterChange({
      ...filters,
      hospitalUse: filters.hospitalUse === true ? undefined : true,
    });
  };

  const toggleOfficine = () => {
    onFilterChange({
      ...filters,
      officineUse: filters.officineUse === true ? undefined : true,
    });
  };

  const toggleForm = (val: string) => {
    const current = filters.form || [];
    const next = current.includes(val) ? current.filter((x) => x !== val) : [...current, val];
    onFilterChange({ ...filters, form: next.length > 0 ? next : undefined });
  };

  const toggleLab = (val: string) => {
    const current = filters.laboratory || [];
    const next = current.includes(val) ? current.filter((x) => x !== val) : [...current, val];
    onFilterChange({ ...filters, laboratory: next.length > 0 ? next : undefined });
  };

  const activeFilterCount =
    (filters.sourceList?.length || 0) +
    (filters.productClassification?.length || 0) +
    (filters.manufacturingOrigin?.length || 0) +
    (filters.hospitalUse ? 1 : 0) +
    (filters.officineUse ? 1 : 0) +
    (filters.form?.length || 0) +
    (filters.laboratory?.length || 0);

  const displayedForms = facets?.forms
    ? showAllForms
      ? facets.forms.slice(0, 25)
      : facets.forms.slice(0, 7)
    : [];

  const displayedLabs = facets?.laboratories
    ? showAllLabs
      ? facets.laboratories.slice(0, 25)
      : facets.laboratories.slice(0, 7)
    : [];

  const content = (
    <div className="space-y-6">
      {/* Header & Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-primary" aria-hidden="true">
            tune
          </span>
          <h2 className="font-bold text-sm text-on-surface">{t.filtersTitle}</h2>
          {activeFilterCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary text-on-primary">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-primary hover:text-primary-container font-medium hover:underline"
          >
            {t.resetFilters}
          </button>
        )}
      </div>

      {/* 1. Source List Filter */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-on-surface uppercase tracking-wider block">
          {t.filterSourceList}
        </label>
        <div className="space-y-1.5">
          <label className="flex items-center justify-between text-xs cursor-pointer p-1.5 rounded hover:bg-surface-container">
            <span className="flex items-center gap-2 text-on-surface">
              <input
                type="checkbox"
                checked={filters.sourceList?.includes('NOMENCLATURE_ACTIVE') || false}
                onChange={() => toggleSourceList('NOMENCLATURE_ACTIVE')}
                className="rounded border-outline-variant text-primary focus:ring-primary"
              />
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                {t.statusActive}
              </span>
            </span>
            <span className="text-[11px] text-on-surface-variant font-mono">
              {facets?.sourceList.NOMENCLATURE_ACTIVE.toLocaleString() ?? '—'}
            </span>
          </label>

          <label className="flex items-center justify-between text-xs cursor-pointer p-1.5 rounded hover:bg-surface-container">
            <span className="flex items-center gap-2 text-on-surface">
              <input
                type="checkbox"
                checked={filters.sourceList?.includes('NON_RENOUVELE') || false}
                onChange={() => toggleSourceList('NON_RENOUVELE')}
                className="rounded border-outline-variant text-primary focus:ring-primary"
              />
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-600" />
                {t.statusNonRenewed}
              </span>
            </span>
            <span className="text-[11px] text-on-surface-variant font-mono">
              {facets?.sourceList.NON_RENOUVELE.toLocaleString() ?? '—'}
            </span>
          </label>

          <label className="flex items-center justify-between text-xs cursor-pointer p-1.5 rounded hover:bg-surface-container">
            <span className="flex items-center gap-2 text-on-surface">
              <input
                type="checkbox"
                checked={filters.sourceList?.includes('RETRAIT') || false}
                onChange={() => toggleSourceList('RETRAIT')}
                className="rounded border-outline-variant text-primary focus:ring-primary"
              />
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-600" />
                {t.statusWithdrawn}
              </span>
            </span>
            <span className="text-[11px] text-on-surface-variant font-mono">
              {facets?.sourceList.RETRAIT.toLocaleString() ?? '—'}
            </span>
          </label>
        </div>
      </div>

      {/* 2. Classification Filter */}
      <div className="space-y-2 pt-2 border-t border-outline-variant/20">
        <label className="text-xs font-bold text-on-surface uppercase tracking-wider block">
          {t.filterClassification}
        </label>
        <div className="space-y-1.5">
          <label className="flex items-center justify-between text-xs cursor-pointer p-1.5 rounded hover:bg-surface-container">
            <span className="flex items-center gap-2 text-on-surface">
              <input
                type="checkbox"
                checked={filters.productClassification?.includes('GE') || false}
                onChange={() => toggleClassification('GE')}
                className="rounded border-outline-variant text-primary focus:ring-primary"
              />
              <span>{t.typeGeneric}</span>
            </span>
            <span className="text-[11px] text-on-surface-variant font-mono">
              {facets?.productClassification.GE.toLocaleString() ?? '—'}
            </span>
          </label>

          <label className="flex items-center justify-between text-xs cursor-pointer p-1.5 rounded hover:bg-surface-container">
            <span className="flex items-center gap-2 text-on-surface">
              <input
                type="checkbox"
                checked={filters.productClassification?.includes('RE') || false}
                onChange={() => toggleClassification('RE')}
                className="rounded border-outline-variant text-primary focus:ring-primary"
              />
              <span>{t.typeReference}</span>
            </span>
            <span className="text-[11px] text-on-surface-variant font-mono">
              {facets?.productClassification.RE.toLocaleString() ?? '—'}
            </span>
          </label>

          <label className="flex items-center justify-between text-xs cursor-pointer p-1.5 rounded hover:bg-surface-container">
            <span className="flex items-center gap-2 text-on-surface">
              <input
                type="checkbox"
                checked={filters.productClassification?.includes('BIO') || false}
                onChange={() => toggleClassification('BIO')}
                className="rounded border-outline-variant text-primary focus:ring-primary"
              />
              <span>{t.typeBiosimilar}</span>
            </span>
            <span className="text-[11px] text-on-surface-variant font-mono">
              {facets?.productClassification.BIO.toLocaleString() ?? '—'}
            </span>
          </label>
        </div>
      </div>

      {/* 3. Manufacturing Origin */}
      <div className="space-y-2 pt-2 border-t border-outline-variant/20">
        <label className="text-xs font-bold text-on-surface uppercase tracking-wider block">
          {t.filterOrigin}
        </label>
        <div className="space-y-1.5">
          <label className="flex items-center justify-between text-xs cursor-pointer p-1.5 rounded hover:bg-surface-container">
            <span className="flex items-center gap-2 text-on-surface">
              <input
                type="checkbox"
                checked={filters.manufacturingOrigin?.includes('F') || false}
                onChange={() => toggleOrigin('F')}
                className="rounded border-outline-variant text-primary focus:ring-primary"
              />
              <span>{t.statusFabricationLocale}</span>
            </span>
            <span className="text-[11px] text-on-surface-variant font-mono">
              {facets?.manufacturingOrigin.F.toLocaleString() ?? '—'}
            </span>
          </label>

          <label className="flex items-center justify-between text-xs cursor-pointer p-1.5 rounded hover:bg-surface-container">
            <span className="flex items-center gap-2 text-on-surface">
              <input
                type="checkbox"
                checked={filters.manufacturingOrigin?.includes('I') || false}
                onChange={() => toggleOrigin('I')}
                className="rounded border-outline-variant text-primary focus:ring-primary"
              />
              <span>{t.statusImportation}</span>
            </span>
            <span className="text-[11px] text-on-surface-variant font-mono">
              {facets?.manufacturingOrigin.I.toLocaleString() ?? '—'}
            </span>
          </label>
        </div>
      </div>

      {/* 4. Dispensary Channels */}
      <div className="space-y-2 pt-2 border-t border-outline-variant/20">
        <label className="text-xs font-bold text-on-surface uppercase tracking-wider block">
          {t.filterDistribution}
        </label>
        <div className="space-y-1.5">
          <label className="flex items-center justify-between text-xs cursor-pointer p-1.5 rounded hover:bg-surface-container">
            <span className="flex items-center gap-2 text-on-surface">
              <input
                type="checkbox"
                checked={filters.hospitalUse === true}
                onChange={toggleHospital}
                className="rounded border-outline-variant text-primary focus:ring-primary"
              />
              <span>{t.filterHospital}</span>
            </span>
            <span className="text-[11px] text-on-surface-variant font-mono">
              {facets?.hospitalUse.toLocaleString() ?? '—'}
            </span>
          </label>

          <label className="flex items-center justify-between text-xs cursor-pointer p-1.5 rounded hover:bg-surface-container">
            <span className="flex items-center gap-2 text-on-surface">
              <input
                type="checkbox"
                checked={filters.officineUse === true}
                onChange={toggleOfficine}
                className="rounded border-outline-variant text-primary focus:ring-primary"
              />
              <span>{t.filterOfficine}</span>
            </span>
            <span className="text-[11px] text-on-surface-variant font-mono">
              {facets?.officineUse.toLocaleString() ?? '—'}
            </span>
          </label>
        </div>
      </div>

      {/* 5. Pharmaceutical Forms */}
      {displayedForms.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-outline-variant/20">
          <label className="text-xs font-bold text-on-surface uppercase tracking-wider block">
            {t.filterForm}
          </label>
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            {displayedForms.map((f) => (
              <label
                key={f.value}
                className="flex items-center justify-between text-xs cursor-pointer p-1 rounded hover:bg-surface-container"
              >
                <span className="flex items-center gap-2 text-on-surface truncate pr-2">
                  <input
                    type="checkbox"
                    checked={filters.form?.includes(f.value) || false}
                    onChange={() => toggleForm(f.value)}
                    className="rounded border-outline-variant text-primary focus:ring-primary shrink-0"
                  />
                  <span className="truncate">{f.value}</span>
                </span>
                <span className="text-[10px] text-on-surface-variant font-mono shrink-0">
                  {f.count.toLocaleString()}
                </span>
              </label>
            ))}
          </div>
          {facets && facets.forms.length > 7 && (
            <button
              type="button"
              onClick={() => setShowAllForms(!showAllForms)}
              className="text-[11px] text-primary hover:underline font-medium block pt-1"
            >
              {showAllForms ? t.showLess : `+ ${facets.forms.length - 7} ${t.showMore}`}
            </button>
          )}
        </div>
      )}

      {/* 6. Laboratories */}
      {displayedLabs.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-outline-variant/20">
          <label className="text-xs font-bold text-on-surface uppercase tracking-wider block">
            {t.filterLaboratory}
          </label>
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            {displayedLabs.map((l) => (
              <label
                key={l.value}
                className="flex items-center justify-between text-xs cursor-pointer p-1 rounded hover:bg-surface-container"
              >
                <span className="flex items-center gap-2 text-on-surface truncate pr-2">
                  <input
                    type="checkbox"
                    checked={filters.laboratory?.includes(l.value) || false}
                    onChange={() => toggleLab(l.value)}
                    className="rounded border-outline-variant text-primary focus:ring-primary shrink-0"
                  />
                  <span className="truncate">{l.value}</span>
                </span>
                <span className="text-[10px] text-on-surface-variant font-mono shrink-0">
                  {l.count.toLocaleString()}
                </span>
              </label>
            ))}
          </div>
          {facets && facets.laboratories.length > 7 && (
            <button
              type="button"
              onClick={() => setShowAllLabs(!showAllLabs)}
              className="text-[11px] text-primary hover:underline font-medium block pt-1"
            >
              {showAllLabs ? t.showLess : `+ ${facets.laboratories.length - 7} ${t.showMore}`}
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:block w-72 bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30 shadow-sm shrink-0 self-start',
          className
        )}
      >
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative ms-auto w-full max-w-xs bg-surface-container-lowest h-full shadow-2xl p-5 overflow-y-auto z-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-outline-variant/30">
                <h3 className="font-bold text-base text-on-surface">{t.filtersTitle}</h3>
                <button
                  type="button"
                  onClick={onCloseMobile}
                  className="p-1 rounded-md text-on-surface-variant hover:bg-surface-container"
                  aria-label="Fermer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
              {content}
            </div>
            <div className="pt-4 mt-6 border-t border-outline-variant/30">
              <button
                type="button"
                onClick={onCloseMobile}
                className="w-full py-2.5 px-4 bg-primary text-on-primary rounded-lg font-medium text-sm text-center shadow-sm"
              >
                {t.applyFilters}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
