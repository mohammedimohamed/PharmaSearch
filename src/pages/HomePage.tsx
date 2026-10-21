import React, { useState } from 'react';
import { StatusBadge } from '@/components/common/StatusBadge';
import { DensityToggle } from '@/components/common/DensityToggle';
import { useI18n } from '@/context/I18nContext';
import { useRouter } from '@/router/RouterContext';
import { useData } from '@/context/DataContext';

export const HomePage: React.FC = () => {
  const { t, isRTL } = useI18n();
  const { navigate } = useRouter();
  const { metadata } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchTerm.trim();
    if (query) {
      navigate('/recherche', { q: query });
    } else {
      navigate('/recherche');
    }
  };

  const handleExampleClick = (query: string) => {
    navigate('/recherche', { q: query });
  };

  const handleSourceListClick = (sourceList: string) => {
    navigate('/recherche', { sourceList });
  };

  const activeCount = metadata?.listCounts.nomenclatureActive ?? 5425;
  const nonRenewedCount = metadata?.listCounts.nonRenouveles ?? 1491;
  const withdrawnCount = metadata?.listCounts.retraits ?? 2679;
  const totalCount = metadata?.totalSourceRows ?? 9595;
  const discrepanciesCount = metadata
    ? metadata.discrepancyCounts.exactMatches + metadata.discrepancyCounts.potentialOverlaps
    : 41;

  const exampleTerms = ['PARACETAMOL', 'AMOXICILLINE', 'METFORMIN', 'ABILIFY', 'MERINAL', 'SAIDAL'];

  return (
    <main className="w-full flex-1 flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-b from-surface-container-low to-surface border-b border-outline-variant/30 py-12 md:py-16 px-4">
        <div className="max-w-[960px] mx-auto flex flex-col items-center text-center gap-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface-container text-primary font-medium text-xs border border-outline-variant/30 shadow-xs">
            <span className="material-symbols-outlined text-[16px] text-primary" aria-hidden="true">
              verified
            </span>
            <span>{t.heroEditionBadge}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-on-surface">
            {t.heroTitlePrefix}{' '}
            <span className="text-primary underline decoration-primary/30 decoration-wavy">
              {t.heroTitleHighlight}
            </span>
          </h1>

          <p className="max-w-[700px] text-base sm:text-lg text-on-surface-variant font-normal leading-relaxed">
            {t.heroSubtitle}
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="w-full max-w-[720px] mt-2">
            <div className="relative flex items-center shadow-md rounded-xl overflow-hidden border border-outline-variant/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 bg-surface-container-lowest transition-all">
              <div className="px-4 text-outline pointer-events-none flex items-center">
                <span className="material-symbols-outlined text-[24px]">search</span>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full py-4 pe-4 text-base bg-transparent text-on-surface placeholder:text-outline focus:outline-none"
                aria-label={t.searchPlaceholder}
              />
              <button
                type="submit"
                className="mx-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-medium text-sm transition-colors cursor-pointer shrink-0 shadow-sm flex items-center gap-1.5"
              >
                <span>{t.searchButton}</span>
                <span className="material-symbols-outlined text-[18px]">
                  {isRTL ? 'arrow_back' : 'arrow_forward'}
                </span>
              </button>
            </div>

            {/* Example Queries */}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-outline justify-center sm:justify-start">
              <span className="font-medium text-on-surface-variant">{t.searchExamplesLabel}:</span>
              {exampleTerms.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => handleExampleClick(term)}
                  className="px-2 py-0.5 rounded-md bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors cursor-pointer border border-outline-variant/20"
                >
                  {term}
                </button>
              ))}
            </div>
          </form>
        </div>
      </section>

      {/* 3 Source Lists Presentation Cards */}
      <section className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-outline-variant/30 pb-4">
            <div>
              <h2 className="text-xl font-bold text-on-surface tracking-tight">
                {t.sourceListsTitle}
              </h2>
              <p className="text-sm text-on-surface-variant">
                {t.sourceListsSubtitle}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-outline">
              <span className="px-2.5 py-1 rounded bg-surface-container border border-outline-variant/30 text-on-surface font-semibold">
                {totalCount.toLocaleString()} {t.totalSourceRowsBadge}
              </span>
              {discrepanciesCount > 0 && (
                <span
                  className="px-2.5 py-1 rounded bg-amber-50 border border-amber-300 text-amber-800 font-medium flex items-center gap-1 cursor-pointer"
                  onClick={() => navigate('/recherche')}
                  title={t.discrepancyNotice}
                >
                  <span className="material-symbols-outlined text-[14px]">warning</span>
                  {discrepanciesCount} {t.discrepancyBadge}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* List 1: Active Nomenclature */}
            <div
              onClick={() => handleSourceListClick('NOMENCLATURE_ACTIVE')}
              className="bg-surface-container-lowest border border-outline-variant/40 hover:border-emerald-500/60 rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700">
                    <span className="material-symbols-outlined text-[22px]">medical_services</span>
                  </span>
                  <StatusBadge sourceList="NOMENCLATURE_ACTIVE" />
                </div>
                <h3 className="text-lg font-bold text-on-surface group-hover:text-primary transition-colors">
                  {t.list1Title}
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {t.list1Desc}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-outline-variant/20 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-on-surface">
                  {activeCount.toLocaleString()}
                </span>
                <span className="text-xs text-outline font-medium flex items-center gap-1 group-hover:text-primary">
                  <span>{t.list1CountLabel}</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </span>
              </div>
            </div>

            {/* List 2: Non Renewed */}
            <div
              onClick={() => handleSourceListClick('NON_RENOUVELE')}
              className="bg-surface-container-lowest border border-outline-variant/40 hover:border-amber-500/60 rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="p-2.5 rounded-lg bg-amber-50 text-amber-700">
                    <span className="material-symbols-outlined text-[22px]">history</span>
                  </span>
                  <StatusBadge sourceList="NON_RENOUVELE" />
                </div>
                <h3 className="text-lg font-bold text-on-surface group-hover:text-amber-800 transition-colors">
                  {t.list2Title}
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {t.list2Desc}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-outline-variant/20 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-on-surface">
                  {nonRenewedCount.toLocaleString()}
                </span>
                <span className="text-xs text-outline font-medium flex items-center gap-1 group-hover:text-amber-800">
                  <span>{t.list2CountLabel}</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </span>
              </div>
            </div>

            {/* List 3: Withdrawals */}
            <div
              onClick={() => handleSourceListClick('RETRAIT')}
              className="bg-surface-container-lowest border border-outline-variant/40 hover:border-red-500/60 rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="p-2.5 rounded-lg bg-red-50 text-red-700">
                    <span className="material-symbols-outlined text-[22px]">block</span>
                  </span>
                  <StatusBadge sourceList="RETRAIT" />
                </div>
                <h3 className="text-lg font-bold text-on-surface group-hover:text-red-700 transition-colors">
                  {t.list3Title}
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {t.list3Desc}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-outline-variant/20 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-on-surface">
                  {withdrawnCount.toLocaleString()}
                </span>
                <span className="text-xs text-outline font-medium flex items-center gap-1 group-hover:text-red-700">
                  <span>{t.list3CountLabel}</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </span>
              </div>
            </div>
          </div>

          {/* Density & Layout Foundation Info */}
          <div className="mt-4 p-5 bg-surface-container-low rounded-xl border border-outline-variant/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[24px] text-primary">
                display_settings
              </span>
              <div>
                <h4 className="font-semibold text-sm text-on-surface">
                  {t.densitySectionTitle}
                </h4>
                <p className="text-xs text-on-surface-variant">
                  {t.densitySectionSubtitle}
                </p>
              </div>
            </div>

            <DensityToggle />
          </div>

          {/* Regulatory Notice Banner */}
          <div className="mt-2 p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/30 text-xs text-on-surface-variant flex items-start gap-3">
            <span className="material-symbols-outlined text-[20px] text-primary shrink-0 mt-0.5">
              info
            </span>
            <div className="space-y-1">
              <span className="font-semibold text-on-surface block">
                {t.sourceSnapshotLabel} : {t.sourceSnapshotDate}
              </span>
              <p className="leading-relaxed">
                {t.legalDisclaimer}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
