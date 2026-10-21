import React, { useState, useEffect } from 'react';
import { useI18n } from '@/context/I18nContext';
import { useRouter } from '@/router/RouterContext';
import { useData } from '@/context/DataContext';
import { useFavourites } from '@/context/FavouritesContext';
import { StatusBadge } from '@/components/common/StatusBadge';
import { cn } from '@/utils/cn';

export const DetailPage: React.FC = () => {
  const { t, isRTL } = useI18n();
  const { path, getParam, navigate } = useRouter();
  const { getRecordById, getRelatedPresentations, getDiscrepantRecords, isLoading } = useData();
  const { isFavourite, toggleFavourite, getAlias, setAlias, removeAlias } = useFavourites();

  // Extract ID from path (/medicament/NOM-123) or query param (?id=NOM-123)
  const recordId = path.startsWith('/medicament/')
    ? decodeURIComponent(path.replace('/medicament/', ''))
    : getParam('id', '');

  const record = getRecordById(recordId);

  // Alias state for editing
  const existingAlias = getAlias(recordId) || '';
  const [aliasInput, setAliasInput] = useState(existingAlias);
  const [isEditingAlias, setIsEditingAlias] = useState(false);

  useEffect(() => {
    setAliasInput(existingAlias);
  }, [existingAlias]);

  if (isLoading) {
    return (
      <main className="w-full max-w-[1100px] mx-auto px-4 py-16 text-center">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">
          progress_activity
        </span>
        <p className="mt-3 text-sm text-on-surface-variant font-medium">
          {t.loadingData}
        </p>
      </main>
    );
  }

  // Record Not Found State
  if (!record) {
    return (
      <main className="w-full max-w-[700px] mx-auto px-4 py-16 text-center">
        <div className="p-8 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-error-container/40 text-error flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl">medication_liquid</span>
          </div>
          <h1 className="text-xl font-bold text-on-surface">{t.notFoundTitle}</h1>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-md mx-auto">
            {t.notFoundDesc} ({recordId || 'ID manquant'})
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => navigate('/recherche')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-lg text-xs font-semibold shadow-sm hover:bg-primary-container transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isRTL ? 'arrow_forward' : 'arrow_back'}
              </span>
              <span>{t.notFoundAction}</span>
            </button>
          </div>
        </div>
      </main>
    );
  }

  const fav = isFavourite(record.id);
  const relatedPresentations = getRelatedPresentations(record.dci, record.id);
  const discrepantRecords = getDiscrepantRecords(record);

  const handleSaveAlias = (e: React.FormEvent) => {
    e.preventDefault();
    if (aliasInput.trim()) {
      setAlias(record.id, aliasInput);
    } else {
      removeAlias(record.id);
    }
    setIsEditingAlias(false);
  };

  const handleRemoveAlias = () => {
    removeAlias(record.id);
    setAliasInput('');
    setIsEditingAlias(false);
  };

  const classificationLabel =
    record.productClassification === 'GE'
      ? t.typeGeneric
      : record.productClassification === 'RE'
      ? t.typeReference
      : record.productClassification === 'BIO'
      ? t.typeBiosimilar
      : record.productClassification;

  const originLabel =
    record.manufacturingOrigin === 'F'
      ? t.statusFabricationLocale
      : record.manufacturingOrigin === 'I'
      ? t.statusImportation
      : record.manufacturingOrigin;

  return (
    <main className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-6">
      {/* Back button */}
      <div>
        <button
          type="button"
          onClick={() => navigate('/recherche')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-container transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">
            {isRTL ? 'arrow_forward' : 'arrow_back'}
          </span>
          <span>{t.backToSearch}</span>
        </button>
      </div>

      {/* Discrepancy Alert Banner */}
      {discrepantRecords.length > 0 && (
        <div
          role="alert"
          className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 shadow-xs space-y-3"
        >
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-2xl text-amber-700 shrink-0 mt-0.5">
              warning
            </span>
            <div className="space-y-1">
              <h2 className="font-bold text-sm sm:text-base text-amber-900">
                {t.discrepancyBannerTitle}
              </h2>
              <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
                {t.discrepancyBannerDesc}
              </p>
            </div>
          </div>

          <div className="ps-9 space-y-2">
            {discrepantRecords.map((target) => (
              <div
                key={target.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 bg-white/80 rounded-xl border border-amber-200 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-on-surface">{target.brandName}</span>
                    <StatusBadge sourceList={target.sourceList} />
                    <span className="text-outline font-mono">({target.registrationNumber})</span>
                    <span className="text-primary font-mono text-[11px]">({target.id})</span>
                  </div>
                  <div className="text-on-surface-variant text-[11px] mt-0.5">
                    {target.dci} — {target.dosage} — {target.form} ({target.provenance.sourceWorksheet})
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(`/medicament/${target.id}`)}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-medium transition-colors shrink-0"
                >
                  {t.discrepancyCompareAction}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invalid Date Banner */}
      {record.initialRegistrationDate.isInvalidDate && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-red-50 border border-red-300 text-red-900 flex items-start gap-3 text-xs"
        >
          <span className="material-symbols-outlined text-xl text-red-600 shrink-0 mt-0.5">
            event_busy
          </span>
          <div className="space-y-1">
            <span className="font-bold block">Avertissement d'intégrité de date</span>
            <p className="leading-relaxed">
              {t.invalidDateWarning}
            </p>
            <p className="font-mono text-[11px] bg-red-100/60 p-1 rounded inline-block">
              Valeur source brute : "{record.initialRegistrationDate.raw}" (Ligne Excel {record.provenance.sourceRow})
            </p>
          </div>
        </div>
      )}

      {/* Administrative Tag in Date */}
      {record.initialRegistrationDate.isAdministrativeTag && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 flex items-start gap-3 text-xs"
        >
          <span className="material-symbols-outlined text-xl text-blue-600 shrink-0 mt-0.5">
            info
          </span>
          <div>
            <span className="font-bold block">{t.administrativeDateNotice}</span>
            <p className="font-mono text-[11px] mt-0.5">
              Mention source brute : "{record.initialRegistrationDate.raw}"
            </p>
          </div>
        </div>
      )}

      {/* Header Monograph Card */}
      <section className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-outline-variant/30 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-outline-variant/20 pb-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge sourceList={record.sourceList} />
              {classificationLabel && (
                <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-surface-container text-on-surface-variant border border-outline-variant/30">
                  {classificationLabel}
                </span>
              )}
              {originLabel && (
                <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-surface-container text-on-surface-variant border border-outline-variant/30">
                  {originLabel}
                </span>
              )}
              {record.hospitalUse && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  <span className="material-symbols-outlined text-[14px]">local_hospital</span>
                  {t.filterHospital}
                </span>
              )}
              {record.officineUse && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="material-symbols-outlined text-[14px]">medication</span>
                  {t.filterOfficine}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-primary">
              {record.brandName}
            </h1>

            <p className="text-base sm:text-lg font-semibold text-on-surface">
              {record.dci}
            </p>

            <div className="flex flex-wrap items-center gap-x-3 text-xs sm:text-sm text-on-surface-variant">
              <span className="font-medium text-on-surface">{record.dosage}</span>
              <span>•</span>
              <span>{record.form}</span>
              {record.packaging && (
                <>
                  <span>•</span>
                  <span>{record.packaging}</span>
                </>
              )}
            </div>
          </div>

          {/* Favourites & Alias Controls */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 shrink-0">
            <button
              type="button"
              onClick={() => toggleFavourite(record.id)}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all duration-150 shadow-xs cursor-pointer',
                fav
                  ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                  : 'bg-surface-container-low text-on-surface hover:border-primary/50 hover:bg-surface-container border-outline-variant/40'
              )}
              aria-label={fav ? t.removeFromFavourites : t.addToFavourites}
            >
              <span
                className={cn('material-symbols-outlined text-[20px]', fav && 'text-amber-500 fill-1')}
                style={fav ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                star
              </span>
              <span>{fav ? t.favSaved : t.addToFavourites}</span>
            </button>

            {/* Alias Box */}
            <div className="w-full md:w-auto">
              {existingAlias && !isEditingAlias ? (
                <div className="flex items-center gap-2 p-2 bg-secondary-container/20 rounded-lg border border-secondary/30 text-xs">
                  <span className="text-secondary font-medium">🏷️ {existingAlias}</span>
                  <button
                    type="button"
                    onClick={() => setIsEditingAlias(true)}
                    className="text-primary hover:underline font-medium text-[11px]"
                  >
                    {t.editAlias}
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveAlias}
                    className="text-error hover:text-error-container text-[11px]"
                    title={t.removeAlias}
                  >
                    ✕
                  </button>
                </div>
              ) : isEditingAlias || !existingAlias ? (
                <form onSubmit={handleSaveAlias} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={aliasInput}
                    onChange={(e) => setAliasInput(e.target.value)}
                    placeholder={t.aliasPlaceholder}
                    className="px-2.5 py-1.5 text-xs bg-surface-container-low border border-outline-variant/50 rounded-lg text-on-surface focus:outline-none focus:ring-1 focus:ring-primary w-44"
                  />
                  <button
                    type="submit"
                    className="px-2.5 py-1.5 bg-primary text-on-primary text-xs rounded-lg font-medium hover:bg-primary-container"
                  >
                    {t.saveAlias}
                  </button>
                  {isEditingAlias && (
                    <button
                      type="button"
                      onClick={() => setIsEditingAlias(false)}
                      className="px-2 py-1.5 text-xs text-on-surface-variant hover:text-on-surface"
                    >
                      Annuler
                    </button>
                  )}
                </form>
              ) : null}
            </div>
          </div>
        </div>

        {/* Detailed Regulatory & Specifications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Clinical / Administrative Identification */}
          <div className="p-5 rounded-xl bg-surface-container-low/60 border border-outline-variant/30 space-y-3">
            <h2 className="font-bold text-sm text-on-surface flex items-center gap-2 border-b border-outline-variant/20 pb-2">
              <span className="material-symbols-outlined text-[18px] text-primary">description</span>
              <span>{t.sectionIdentification}</span>
            </h2>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <dt className="text-on-surface-variant font-medium">{t.fieldRegistrationNumber}</dt>
                <dd className="font-mono font-bold text-on-surface mt-0.5">{record.registrationNumber}</dd>
              </div>
              <div>
                <dt className="text-on-surface-variant font-medium">{t.fieldCode}</dt>
                <dd className="font-mono text-on-surface mt-0.5">{record.code || '—'}</dd>
              </div>
              <div>
                <dt className="text-on-surface-variant font-medium">{t.fieldDosage}</dt>
                <dd className="font-medium text-on-surface mt-0.5">{record.dosage || '—'}</dd>
              </div>
              <div>
                <dt className="text-on-surface-variant font-medium">{t.fieldForm}</dt>
                <dd className="font-medium text-on-surface mt-0.5">{record.form || '—'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-on-surface-variant font-medium">{t.fieldPackaging}</dt>
                <dd className="font-medium text-on-surface mt-0.5">{record.packaging || '—'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-on-surface-variant font-medium">{t.fieldSchedule}</dt>
                <dd className="font-medium text-on-surface mt-0.5">
                  {record.rawPrescriptionSchedule
                    ? `${record.rawPrescriptionSchedule}`
                    : t.scheduleUnspecified}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-on-surface-variant font-medium">{t.codeTypeLabel}</dt>
                <dd className="font-medium text-on-surface mt-0.5">
                  {record.productClassification === 'GE'
                    ? t.typeGenericDesc
                    : record.productClassification === 'RE'
                    ? t.typeReferenceDesc
                    : record.productClassification === 'BIO'
                    ? t.typeBioDesc
                    : record.productClassification || t.typeUnspecified}
                </dd>
              </div>
            </dl>
          </div>

          {/* Card 2: Marketing Authorization Holder */}
          <div className="p-5 rounded-xl bg-surface-container-low/60 border border-outline-variant/30 space-y-3">
            <h2 className="font-bold text-sm text-on-surface flex items-center gap-2 border-b border-outline-variant/20 pb-2">
              <span className="material-symbols-outlined text-[18px] text-primary">domain</span>
              <span>{t.sectionLaboratories}</span>
            </h2>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <dt className="text-on-surface-variant font-medium">{t.fieldLaboratory}</dt>
                <dd className="font-semibold text-on-surface mt-0.5">{record.laboratory || '—'}</dd>
              </div>
              <div>
                <dt className="text-on-surface-variant font-medium">{t.fieldCountry}</dt>
                <dd className="font-medium text-on-surface mt-0.5">{record.country || '—'}</dd>
              </div>
              <div>
                <dt className="text-on-surface-variant font-medium">{t.codeStatutLabel}</dt>
                <dd className="font-medium text-on-surface mt-0.5">{originLabel || t.p1Unspecified}</dd>
              </div>
              <div>
                <dt className="text-on-surface-variant font-medium">{t.codeP1Label}</dt>
                <dd className="font-medium text-on-surface mt-0.5">
                  {record.hospitalUse ? t.p1Specified : t.p1Unspecified}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-on-surface-variant font-medium">{t.codeP2Label}</dt>
                <dd className="font-medium text-on-surface mt-0.5">
                  {record.officineUse ? t.p2Specified : t.p2Unspecified}
                </dd>
              </div>
            </dl>
          </div>

          {/* Card 3: Status & Dates */}
          <div className="p-5 rounded-xl bg-surface-container-low/60 border border-outline-variant/30 space-y-3">
            <h2 className="font-bold text-sm text-on-surface flex items-center gap-2 border-b border-outline-variant/20 pb-2">
              <span className="material-symbols-outlined text-[18px] text-primary">event</span>
              <span>{t.sectionStatusDates}</span>
            </h2>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <dt className="text-on-surface-variant font-medium">{t.fieldInitialRegDate}</dt>
                <dd className="font-medium text-on-surface mt-0.5">
                  {record.initialRegistrationDate.formatted || record.initialRegistrationDate.raw || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-on-surface-variant font-medium">{t.fieldReRegistrationDate}</dt>
                <dd className="font-medium text-on-surface mt-0.5">
                  {record.finalRegistrationDate?.formatted || record.finalRegistrationDate?.raw || '—'}
                </dd>
              </div>
              {record.withdrawalDate && (
                <div>
                  <dt className="text-on-surface-variant font-medium">{t.fieldWithdrawalDate}</dt>
                  <dd className="font-medium text-error mt-0.5">
                    {record.withdrawalDate.formatted || record.withdrawalDate.raw || '—'}
                  </dd>
                </div>
              )}
              {record.withdrawalReason && (
                <div className="sm:col-span-2">
                  <dt className="text-on-surface-variant font-medium">{t.fieldWithdrawalReason}</dt>
                  <dd className="font-medium text-error mt-0.5 bg-red-50 p-2 rounded border border-red-200">
                    {record.withdrawalReason}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Card 4: Technical Provenance */}
          <div className="p-5 rounded-xl bg-surface-container-low/60 border border-outline-variant/30 space-y-3">
            <h2 className="font-bold text-sm text-on-surface flex items-center gap-2 border-b border-outline-variant/20 pb-2">
              <span className="material-symbols-outlined text-[18px] text-primary">fact_check</span>
              <span>{t.sectionProvenance}</span>
            </h2>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <dt className="text-on-surface-variant font-medium">{t.fieldSourceWorksheet}</dt>
                <dd className="font-mono text-on-surface mt-0.5">{record.provenance.sourceWorksheet}</dd>
              </div>
              <div>
                <dt className="text-on-surface-variant font-medium">{t.fieldSourceRow}</dt>
                <dd className="font-mono font-bold text-on-surface mt-0.5">Ligne {record.provenance.sourceRow}</dd>
              </div>
              <div>
                <dt className="text-on-surface-variant font-medium">{t.fieldSnapshotDate}</dt>
                <dd className="font-medium text-on-surface mt-0.5">{record.provenance.snapshotDate}</dd>
              </div>
              <div>
                <dt className="text-on-surface-variant font-medium">Identifiant unique stable</dt>
                <dd className="font-mono text-primary text-[11px] mt-0.5">{record.id}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Related presentations of same INN (DCI) */}
      {relatedPresentations.length > 0 && (
        <section className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-outline-variant/30 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
            <div>
              <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-[22px] text-primary">dataset</span>
                <span>{t.relatedPresentationsTitle}</span>
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {t.relatedPresentationsDesc} ({relatedPresentations.length})
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {relatedPresentations.slice(0, 12).map((rel) => (
              <div
                key={rel.id}
                onClick={() => navigate(`/medicament/${rel.id}`)}
                className="p-3.5 rounded-xl border border-outline-variant/30 hover:border-primary/60 bg-surface-container-low hover:bg-surface-container cursor-pointer transition-all space-y-1.5 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-xs text-primary group-hover:underline truncate">
                    {rel.brandName}
                  </span>
                  <StatusBadge sourceList={rel.sourceList} />
                </div>
                <div className="text-[11px] text-on-surface-variant space-y-0.5">
                  <div className="text-on-surface font-medium truncate">{rel.dosage} • {rel.form}</div>
                  <div className="text-outline truncate">{rel.laboratory}</div>
                </div>
              </div>
            ))}
          </div>

          {relatedPresentations.length > 12 && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => navigate('/recherche', { q: record.dci })}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Voir l'ensemble des {relatedPresentations.length} spécialités avec la DCI « {record.dci} » →
              </button>
            </div>
          )}
        </section>
      )}
    </main>
  );
};
