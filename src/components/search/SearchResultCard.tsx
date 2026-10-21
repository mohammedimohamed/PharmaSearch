import React from 'react';
import type { PharmaceuticalRecord } from '@/types';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useFavourites, type DensityMode } from '@/context/FavouritesContext';
import { useI18n } from '@/context/I18nContext';
import { useRouter } from '@/router/RouterContext';
import { cn } from '@/utils/cn';

interface SearchResultCardProps {
  record: PharmaceuticalRecord;
  density?: DensityMode;
  className?: string;
}

export const SearchResultCard: React.FC<SearchResultCardProps> = ({
  record,
  density = 'standard',
  className,
}) => {
  const { isFavourite, toggleFavourite, getAlias } = useFavourites();
  const { t } = useI18n();
  const { navigate } = useRouter();

  const fav = isFavourite(record.id);
  const alias = getAlias(record.id);
  const hasDiscrepancy = Boolean(record.discrepancies && record.discrepancies.length > 0);

  const handleCardClick = (e: React.MouseEvent) => {
    // If user clicked inside a button or link, don't trigger card navigation
    if ((e.target as HTMLElement).closest('button, a')) {
      return;
    }
    navigate(`/medicament/${record.id}`);
  };

  const classificationLabel =
    record.productClassification === 'GE'
      ? t.typeGeneric
      : record.productClassification === 'RE'
      ? t.typeReference
      : record.productClassification === 'BIO'
      ? t.typeBiosimilar
      : null;

  const originLabel =
    record.manufacturingOrigin === 'F'
      ? t.statusFabricationLocale
      : record.manufacturingOrigin === 'I'
      ? t.statusImportation
      : null;

  // COMPACT MODE
  if (density === 'compact') {
    return (
      <div
        onClick={handleCardClick}
        className={cn(
          'group flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg border transition-all duration-150 cursor-pointer',
          'bg-surface-container-lowest hover:bg-surface-container-low border-outline-variant/30 hover:border-primary/50 shadow-sm',
          className
        )}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavourite(record.id);
            }}
            className={cn(
              'p-1.5 rounded-full transition-colors shrink-0',
              fav ? 'text-amber-500 hover:text-amber-600' : 'text-outline hover:text-primary hover:bg-surface-container'
            )}
            title={fav ? t.removeFromFavourites : t.addToFavourites}
            aria-label={fav ? t.removeFromFavourites : t.addToFavourites}
          >
            <span
              className={cn('material-symbols-outlined text-[18px]', fav && 'fill-1')}
              style={fav ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              star
            </span>
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-sm text-primary group-hover:underline truncate">
                {record.brandName}
              </span>
              <StatusBadge sourceList={record.sourceList} />
              {hasDiscrepancy && (
                <span
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-300"
                  title={t.discrepancyNotice}
                >
                  <span className="material-symbols-outlined text-[13px]">warning</span>
                  {t.discrepancyBadge}
                </span>
              )}
              {alias && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-secondary-container/40 text-secondary border border-secondary/30">
                  🏷️ {alias}
                </span>
              )}
            </div>

            <div className="text-xs text-on-surface-variant flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
              <span className="font-medium text-on-surface">{record.dci}</span>
              <span>•</span>
              <span>{record.dosage}</span>
              <span>•</span>
              <span>{record.form}</span>
              <span className="text-outline">({record.registrationNumber})</span>
            </div>
          </div>
        </div>

        <div className="mt-2 sm:mt-0 flex items-center gap-2 text-xs text-on-surface-variant shrink-0 ps-9 sm:ps-0">
          <span className="truncate max-w-[150px] font-medium">{record.laboratory}</span>
          <span className="material-symbols-outlined text-[18px] text-outline group-hover:text-primary group-hover:translate-x-0.5 transition-transform">
            chevron_right
          </span>
        </div>
      </div>
    );
  }

  // COMFORTABLE (AÉRÉ) MODE
  if (density === 'comfortable') {
    return (
      <div
        onClick={handleCardClick}
        className={cn(
          'group p-6 rounded-xl border transition-all duration-150 cursor-pointer space-y-4',
          'bg-surface-container-lowest hover:bg-surface-container-low border-outline-variant/40 hover:border-primary shadow-sm hover:shadow-md',
          className
        )}
      >
        {/* Header Badges & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/20 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge sourceList={record.sourceList} />
            {classificationLabel && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-surface-container text-on-surface-variant border border-outline-variant/30">
                {classificationLabel}
              </span>
            )}
            {originLabel && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-surface-container text-on-surface-variant border border-outline-variant/30">
                {originLabel}
              </span>
            )}
            {record.hospitalUse && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                <span className="material-symbols-outlined text-[14px]">local_hospital</span>
                {t.filterHospital}
              </span>
            )}
            {record.officineUse && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="material-symbols-outlined text-[14px]">medication</span>
                {t.filterOfficine}
              </span>
            )}
            {hasDiscrepancy && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-800 border border-amber-300">
                <span className="material-symbols-outlined text-[14px]">warning</span>
                {t.discrepancyBadge}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavourite(record.id);
            }}
            className={cn(
              'inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors',
              fav
                ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                : 'bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:text-primary hover:border-primary/40'
            )}
            aria-label={fav ? t.removeFromFavourites : t.addToFavourites}
          >
            <span
              className={cn('material-symbols-outlined text-[16px]', fav && 'text-amber-500 fill-1')}
              style={fav ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              star
            </span>
            <span>{fav ? t.favSaved : t.addToFavourites}</span>
          </button>
        </div>

        {/* Brand & DCI */}
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-xl font-bold text-primary group-hover:underline">
              {record.brandName}
            </h3>
            <span className="text-xs font-mono text-outline">{record.registrationNumber}</span>
          </div>
          <p className="text-sm font-semibold text-on-surface mt-0.5">{record.dci}</p>
          {alias && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-secondary-container/30 text-secondary text-xs font-medium border border-secondary/20">
              <span>🏷️</span>
              <span>
                <strong>{t.aliasLabel}:</strong> {alias}
              </span>
            </div>
          )}
        </div>

        {/* Detailed specs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-3.5 bg-surface-container-low/60 rounded-lg text-xs">
          <div>
            <span className="text-on-surface-variant block">{t.fieldDosage}:</span>
            <span className="font-medium text-on-surface">{record.dosage || '—'}</span>
          </div>
          <div>
            <span className="text-on-surface-variant block">{t.fieldForm}:</span>
            <span className="font-medium text-on-surface">{record.form || '—'}</span>
          </div>
          <div>
            <span className="text-on-surface-variant block">{t.fieldPackaging}:</span>
            <span className="font-medium text-on-surface">{record.packaging || '—'}</span>
          </div>
          <div>
            <span className="text-on-surface-variant block">{t.fieldLaboratory}:</span>
            <span className="font-medium text-on-surface">{record.laboratory || '—'}</span>
          </div>
          <div>
            <span className="text-on-surface-variant block">{t.fieldCountry}:</span>
            <span className="font-medium text-on-surface">{record.country || '—'}</span>
          </div>
          <div>
            <span className="text-on-surface-variant block">{t.fieldInitialRegDate}:</span>
            <span className="font-medium text-on-surface">
              {record.initialRegistrationDate.formatted || record.initialRegistrationDate.raw || '—'}
            </span>
          </div>
        </div>

        {/* Provenance Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-on-surface-variant border-t border-outline-variant/15">
          <span>
            {record.provenance.sourceWorksheet} (Ligne {record.provenance.sourceRow})
          </span>
          <span className="inline-flex items-center gap-1 text-primary font-medium group-hover:translate-x-1 transition-transform">
            <span>{t.viewDetails}</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </span>
        </div>
      </div>
    );
  }

  // STANDARD MODE (Default)
  return (
    <div
      onClick={handleCardClick}
      className={cn(
        'group p-4 sm:p-5 rounded-xl border transition-all duration-150 cursor-pointer flex flex-col justify-between',
        'bg-surface-container-lowest hover:bg-surface-container-low border-outline-variant/30 hover:border-primary/60 shadow-sm hover:shadow',
        className
      )}
    >
      <div>
        {/* Top Badges & Favourite */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge sourceList={record.sourceList} />
            {classificationLabel && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-surface-container text-on-surface-variant border border-outline-variant/30">
                {classificationLabel}
              </span>
            )}
            {originLabel && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-surface-container text-on-surface-variant border border-outline-variant/30">
                {originLabel}
              </span>
            )}
            {hasDiscrepancy && (
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-300"
                title={t.discrepancyNotice}
              >
                <span className="material-symbols-outlined text-[13px]">warning</span>
                {t.discrepancyBadge}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavourite(record.id);
            }}
            className={cn(
              'p-1.5 rounded-full transition-colors shrink-0 -me-1 -mt-1',
              fav ? 'text-amber-500 hover:text-amber-600' : 'text-outline hover:text-primary hover:bg-surface-container'
            )}
            title={fav ? t.removeFromFavourites : t.addToFavourites}
            aria-label={fav ? t.removeFromFavourites : t.addToFavourites}
          >
            <span
              className={cn('material-symbols-outlined text-[20px]', fav && 'fill-1')}
              style={fav ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              star
            </span>
          </button>
        </div>

        {/* Brand Name & Alias */}
        <div className="mb-2">
          <h3 className="text-lg font-bold text-primary group-hover:underline">
            {record.brandName}
          </h3>
          <p className="text-sm font-semibold text-on-surface mt-0.5">{record.dci}</p>
          {alias && (
            <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-secondary-container/30 text-secondary text-xs font-medium border border-secondary/20">
              <span>🏷️</span>
              <span>{alias}</span>
            </div>
          )}
        </div>

        {/* Specs */}
        <div className="text-xs text-on-surface-variant space-y-1 mb-3">
          <div className="flex flex-wrap items-center gap-x-2">
            <span className="font-medium text-on-surface">{record.dosage}</span>
            <span>•</span>
            <span>{record.form}</span>
            {record.packaging && (
              <>
                <span>•</span>
                <span className="text-outline truncate max-w-[200px]">{record.packaging}</span>
              </>
            )}
          </div>
          <div className="text-outline text-[11px]">{record.laboratory} ({record.country})</div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2.5 border-t border-outline-variant/20 text-xs">
        <span className="font-mono text-[11px] text-outline">
          N° {record.registrationNumber}
        </span>
        <span className="inline-flex items-center gap-1 text-primary font-medium group-hover:translate-x-0.5 transition-transform text-xs">
          <span>{t.viewDetails}</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </span>
      </div>
    </div>
  );
};
