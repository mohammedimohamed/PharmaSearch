import React, { useState } from 'react';
import { useI18n } from '@/context/I18nContext';
import { useRouter } from '@/router/RouterContext';
import { useData } from '@/context/DataContext';
import { useFavourites } from '@/context/FavouritesContext';
import { SearchResultCard } from '@/components/search/SearchResultCard';
import { DensityToggle } from '@/components/common/DensityToggle';

export const FavouritesPage: React.FC = () => {
  const { t, isRTL } = useI18n();
  const { navigate } = useRouter();
  const { getRecordById, isLoading } = useData();
  const { favourites, aliases, clearFavourites, densityMode, setAlias, removeAlias } = useFavourites();

  const [confirmClear, setConfirmClear] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [aliasValue, setAliasValue] = useState('');

  const favouriteRecords = favourites
    .map((id) => getRecordById(id))
    .filter((rec): rec is NonNullable<typeof rec> => rec !== undefined);

  const handleStartEdit = (id: string, current: string) => {
    setEditingId(id);
    setAliasValue(current);
  };

  const handleSaveEdit = (id: string) => {
    if (aliasValue.trim()) {
      setAlias(id, aliasValue);
    } else {
      removeAlias(id);
    }
    setEditingId(null);
  };

  const handleClearAll = () => {
    clearFavourites();
    setConfirmClear(false);
  };

  return (
    <main className="w-full max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl text-amber-500 fill-1" style={{ fontVariationSettings: "'FILL' 1" }}>
              star
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface">
              {t.favouritesTitle}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface-container text-on-surface-variant">
              {favouriteRecords.length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            {t.favouritesSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <DensityToggle />
          {favouriteRecords.length > 0 && (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="px-3 py-1.5 text-xs font-medium text-error hover:bg-error-container/30 border border-error/30 rounded-lg transition-colors cursor-pointer"
            >
              {t.favouritesClearAll}
            </button>
          )}
        </div>
      </div>

      {/* Local Storage Disclaimer Notice */}
      <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/30 text-xs text-on-surface-variant flex items-start gap-3">
        <span className="material-symbols-outlined text-[20px] text-primary shrink-0 mt-0.5">
          devices
        </span>
        <p className="leading-relaxed">
          {t.favouritesLocalDisclaimer}
        </p>
      </div>

      {/* Confirmation Modal / Bar for Clear All */}
      {confirmClear && (
        <div
          role="alertdialog"
          aria-modal="true"
          className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-amber-600">
              help
            </span>
            <span className="font-semibold">{t.favouritesClearConfirm}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClearAll}
              className="px-3 py-1.5 bg-error text-white font-medium rounded-md hover:bg-error/90 transition-colors"
            >
              Oui, tout supprimer
            </button>
            <button
              type="button"
              onClick={() => setConfirmClear(false)}
              className="px-3 py-1.5 bg-surface-container text-on-surface font-medium rounded-md hover:bg-surface-container-high transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Aliases quick review bar if any aliases exist */}
      {Object.keys(aliases).length > 0 && (
        <section className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-xs space-y-2">
          <h2 className="text-xs font-bold text-on-surface flex items-center gap-1.5">
            <span>🏷️</span>
            <span>{t.aliasLabel}s personnalisés attribués :</span>
          </h2>
          <div className="flex flex-wrap gap-2 text-xs">
            {Object.entries(aliases).map(([id, alias]) => {
              const rec = getRecordById(id);
              if (!rec) return null;
              return (
                <div
                  key={id}
                  className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-surface-container text-on-surface border border-outline-variant/30"
                >
                  <span className="font-bold text-primary">{rec.brandName}</span>
                  <span className="text-outline">→</span>
                  {editingId === id ? (
                    <span className="inline-flex items-center gap-1">
                      <input
                        type="text"
                        value={aliasValue}
                        onChange={(e) => setAliasValue(e.target.value)}
                        className="px-1.5 py-0.5 text-xs bg-white rounded border border-primary text-on-surface w-28"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(id)}
                        className="text-primary font-bold hover:underline"
                      >
                        ✓
                      </button>
                    </span>
                  ) : (
                    <span className="font-medium text-secondary">« {alias} »</span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleStartEdit(id, alias)}
                    className="text-outline hover:text-primary"
                    title={t.editAlias}
                  >
                    <span className="material-symbols-outlined text-[14px]">edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeAlias(id)}
                    className="text-outline hover:text-error"
                    title={t.removeAlias}
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Loading or Empty or List */}
      {isLoading ? (
        <div className="p-12 text-center bg-surface-container-lowest rounded-xl border border-outline-variant/30">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">
            progress_activity
          </span>
          <p className="mt-3 text-sm text-on-surface-variant font-medium">
            {t.loadingData}
          </p>
        </div>
      ) : favouriteRecords.length === 0 ? (
        <div className="p-12 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant/30 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl">star_outline</span>
          </div>
          <h3 className="text-lg font-bold text-on-surface">{t.favouritesEmptyTitle}</h3>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-md mx-auto">
            {t.favouritesEmptyDesc}
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => navigate('/recherche')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-lg text-xs font-semibold shadow-sm hover:bg-primary-container transition-colors"
            >
              <span>{t.navRegistry}</span>
              <span className="material-symbols-outlined text-[18px]">
                {isRTL ? 'arrow_back' : 'arrow_forward'}
              </span>
            </button>
          </div>
        </div>
      ) : (
        <div
          className={
            densityMode === 'compact'
              ? 'space-y-2'
              : densityMode === 'comfortable'
              ? 'space-y-5'
              : 'grid grid-cols-1 md:grid-cols-2 gap-4'
          }
        >
          {favouriteRecords.map((record) => (
            <SearchResultCard
              key={record.id}
              record={record}
              density={densityMode}
            />
          ))}
        </div>
      )}
    </main>
  );
};
