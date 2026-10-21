import React, { useState, useEffect, useMemo, useTransition } from 'react';
import { useI18n } from '@/context/I18nContext';
import { useRouter } from '@/router/RouterContext';
import { useData } from '@/context/DataContext';
import { useFavourites } from '@/context/FavouritesContext';
import { SearchResultCard } from '@/components/search/SearchResultCard';
import { FilterSidebar } from '@/components/search/FilterSidebar';
import { Pagination } from '@/components/common/Pagination';
import { DensityToggle } from '@/components/common/DensityToggle';
import type { SearchFilterOptions, SortOrder } from '@/services/searchService';
import type { SourceListType } from '@/types';

const PAGE_SIZE = 20;

export const SearchPage: React.FC = () => {
  const { t, isRTL } = useI18n();
  const { params, navigate, getParam } = useRouter();
  const { search, getFacets, isLoading, error } = useData();
  const { densityMode, addRecentSearch } = useFavourites();

  const [, startTransition] = useTransition();

  // Search input state
  const queryParam = getParam('q', '');
  const [searchInput, setSearchInput] = useState(queryParam);
  const [activeQuery, setActiveQuery] = useState(queryParam);

  // Filter state
  const sourceListParam = getParam('sourceList') as SourceListType | '';
  const [filters, setFilters] = useState<SearchFilterOptions>(() => {
    const initial: SearchFilterOptions = {};
    if (sourceListParam) {
      initial.sourceList = [sourceListParam];
    }
    return initial;
  });

  const [sortOrder, setSortOrder] = useState<SortOrder>('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync state if URL query param changes externally
  useEffect(() => {
    const q = getParam('q', '');
    setSearchInput(q);
    setActiveQuery(q);
    if (q) {
      addRecentSearch(q);
    }
  }, [params.q, getParam, addRecentSearch]);

  // Sync sourceList param if present in URL
  useEffect(() => {
    const sl = getParam('sourceList') as SourceListType | '';
    if (sl) {
      setFilters((prev) => ({
        ...prev,
        sourceList: [sl],
      }));
    }
  }, [params.sourceList, getParam]);

  // Perform search
  const searchResults = useMemo(() => {
    return search(activeQuery, filters, sortOrder);
  }, [search, activeQuery, filters, sortOrder]);

  // Facets calculated across all search matches
  const facets = useMemo(() => {
    return getFacets(searchResults.records);
  }, [getFacets, searchResults.records]);

  // Pagination slice
  const totalPages = Math.ceil(searchResults.totalHits / PAGE_SIZE) || 1;
  const paginatedRecords = useMemo(() => {
    const from = (currentPage - 1) * PAGE_SIZE;
    return searchResults.records.slice(from, from + PAGE_SIZE);
  }, [searchResults.records, currentPage]);

  // Reset page when query, filter, or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeQuery, filters, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchInput.trim();
    startTransition(() => {
      setActiveQuery(clean);
      navigate('/recherche', { ...params, q: clean || undefined });
      if (clean) addRecentSearch(clean);
    });
  };

  const handleClearSearch = () => {
    setSearchInput('');
    startTransition(() => {
      setActiveQuery('');
      navigate('/recherche', { ...params, q: undefined });
    });
  };

  const handleResetFilters = () => {
    setFilters({});
    navigate('/recherche', { q: activeQuery || undefined });
  };

  const activeFilterCount =
    (filters.sourceList?.length || 0) +
    (filters.productClassification?.length || 0) +
    (filters.manufacturingOrigin?.length || 0) +
    (filters.hospitalUse ? 1 : 0) +
    (filters.officineUse ? 1 : 0) +
    (filters.form?.length || 0) +
    (filters.laboratory?.length || 0);

  return (
    <main className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col">
      {/* Search Header Bar */}
      <section className="bg-surface-container-lowest p-4 sm:p-6 rounded-2xl border border-outline-variant/30 shadow-sm mb-6">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 flex items-center bg-surface-container-low rounded-xl border border-outline-variant/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
            <span className="ps-4 text-outline pointer-events-none flex items-center">
              <span className="material-symbols-outlined text-[22px]">search</span>
            </span>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full py-3 px-3 text-sm sm:text-base bg-transparent text-on-surface placeholder:text-outline focus:outline-none"
              aria-label={t.searchPlaceholder}
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="pe-3 text-outline hover:text-on-surface transition-colors"
                title={t.clearSearch}
                aria-label={t.clearSearch}
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>

          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-medium text-sm transition-colors cursor-pointer shrink-0 shadow-sm flex items-center justify-center gap-2"
          >
            <span>{t.searchButton}</span>
            <span className="material-symbols-outlined text-[18px]">
              {isRTL ? 'arrow_back' : 'arrow_forward'}
            </span>
          </button>
        </form>

        {/* Query status and controls */}
        <div className="mt-4 pt-4 border-t border-outline-variant/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-on-surface-variant font-medium flex-wrap min-w-0">
            <span>
              {t.resultsFound
                .replace('{count}', searchResults.totalHits.toLocaleString())
                .replace('{time}', searchResults.executionTimeMs.toString())}
            </span>
            {activeQuery && (
              <span className="font-semibold text-primary truncate max-w-[200px]">« {activeQuery} »</span>
            )}
          </div>

          {/* Controls: Sort and Density */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto sm:ms-auto">
            {/* Mobile Filter Button */}
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-surface-container hover:bg-surface-container-high rounded-lg border border-outline-variant/40 text-on-surface font-medium shrink-0 cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              <span>{t.filtersTitle}</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-primary text-on-primary text-[10px] font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort Dropdown */}
            <div className="flex-1 sm:flex-initial flex items-center gap-1.5 min-w-[140px] max-w-full">
              <span className="text-on-surface-variant hidden md:inline shrink-0">{t.sortLabel}:</span>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className="w-full sm:w-auto bg-surface-container-low border border-outline-variant/40 rounded-lg py-1.5 px-2.5 text-xs text-on-surface font-medium focus:ring-1 focus:ring-primary focus:outline-none truncate"
                aria-label={t.sortLabel}
              >
                <option value="relevance">{t.sortRelevance}</option>
                <option value="brand_asc">{t.sortBrandAsc}</option>
                <option value="brand_desc">{t.sortBrandDesc}</option>
                <option value="dci_asc">{t.sortDciAsc}</option>
                <option value="dci_desc">{t.sortDciDesc}</option>
                <option value="date_desc">{t.sortDateDesc}</option>
                <option value="date_asc">{t.sortDateAsc}</option>
              </select>
            </div>

            {/* Density Toggle */}
            <div className="w-full sm:w-auto flex justify-center sm:justify-start">
              <DensityToggle className="w-full sm:w-auto" />
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFilterCount > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-3 border-t border-outline-variant/20">
            <span className="text-xs text-on-surface-variant font-medium me-1">
              Filtres actifs:
            </span>
            {filters.sourceList?.map((sl) => (
              <span
                key={sl}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-surface-container text-on-surface border border-outline-variant/40"
              >
                <span>{sl}</span>
                <button
                  type="button"
                  onClick={() =>
                    setFilters({
                      ...filters,
                      sourceList: filters.sourceList?.filter((x) => x !== sl),
                    })
                  }
                  className="hover:text-error"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </span>
            ))}
            {filters.productClassification?.map((cl) => (
              <span
                key={cl}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-surface-container text-on-surface border border-outline-variant/40"
              >
                <span>{cl}</span>
                <button
                  type="button"
                  onClick={() =>
                    setFilters({
                      ...filters,
                      productClassification: filters.productClassification?.filter((x) => x !== cl),
                    })
                  }
                  className="hover:text-error"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </span>
            ))}
            {filters.manufacturingOrigin?.map((mo) => (
              <span
                key={mo}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-surface-container text-on-surface border border-outline-variant/40"
              >
                <span>{mo === 'F' ? t.statusFabricationLocale : t.statusImportation}</span>
                <button
                  type="button"
                  onClick={() =>
                    setFilters({
                      ...filters,
                      manufacturingOrigin: filters.manufacturingOrigin?.filter((x) => x !== mo),
                    })
                  }
                  className="hover:text-error"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </span>
            ))}
            {filters.hospitalUse && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-surface-container text-on-surface border border-outline-variant/40">
                <span>{t.filterHospital}</span>
                <button
                  type="button"
                  onClick={() => setFilters({ ...filters, hospitalUse: undefined })}
                  className="hover:text-error"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </span>
            )}
            {filters.officineUse && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-surface-container text-on-surface border border-outline-variant/40">
                <span>{t.filterOfficine}</span>
                <button
                  type="button"
                  onClick={() => setFilters({ ...filters, officineUse: undefined })}
                  className="hover:text-error"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-primary hover:underline font-medium ms-2"
            >
              {t.resetFilters}
            </button>
          </div>
        )}
      </section>

      {/* Main Layout: Sidebar + Results */}
      <div className="flex items-start gap-6 flex-1">
        {/* Facet Sidebar */}
        <FilterSidebar
          filters={filters}
          facets={facets}
          onFilterChange={(newFilters) => setFilters(newFilters)}
          onReset={handleResetFilters}
          isOpenMobile={isMobileFilterOpen}
          onCloseMobile={() => setIsMobileFilterOpen(false)}
        />

        {/* Results Area */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          {isLoading ? (
            <div className="p-12 text-center bg-surface-container-lowest rounded-xl border border-outline-variant/30">
              <span className="material-symbols-outlined text-4xl text-primary animate-spin">
                progress_activity
              </span>
              <p className="mt-3 text-sm text-on-surface-variant font-medium">
                {t.loadingData}
              </p>
            </div>
          ) : error ? (
            <div className="p-8 text-center bg-error-container/20 border border-error/30 rounded-xl text-error">
              <span className="material-symbols-outlined text-4xl">error</span>
              <h3 className="text-base font-bold mt-2">{t.errorLoadingData}</h3>
              <p className="text-xs mt-1 text-on-surface-variant">{error}</p>
            </div>
          ) : searchResults.totalHits === 0 ? (
            <div className="p-12 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant/30 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-surface-container flex items-center justify-center text-outline">
                <span className="material-symbols-outlined text-3xl">search_off</span>
              </div>
              <h3 className="text-lg font-bold text-on-surface">{t.noResultsTitle}</h3>
              <p className="text-xs sm:text-sm text-on-surface-variant max-w-md mx-auto">
                {t.noResultsDesc}
              </p>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-medium shadow-sm hover:bg-primary-container transition-colors"
                >
                  {t.resetFilters}
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Density Mode Class Wrapper */}
              <div
                className={
                  densityMode === 'compact'
                    ? 'space-y-2'
                    : densityMode === 'comfortable'
                    ? 'space-y-5'
                    : 'grid grid-cols-1 md:grid-cols-2 gap-4'
                }
              >
                {paginatedRecords.map((record) => (
                  <SearchResultCard
                    key={record.id}
                    record={record}
                    density={densityMode}
                  />
                ))}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalHits={searchResults.totalHits}
                pageSize={PAGE_SIZE}
                onPageChange={(page) => {
                  setCurrentPage(page);
                  window.scrollTo({ top: 120, behavior: 'smooth' });
                }}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
};
