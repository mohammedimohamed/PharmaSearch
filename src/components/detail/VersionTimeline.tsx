import React, { useState, useEffect } from 'react';
import { useI18n } from '@/context/I18nContext';
import { MedicineHistoryItem, TimelineEvent } from '@/types/pharmaceutical';

interface VersionTimelineProps {
  recordId: string;
}

export const VersionTimeline: React.FC<VersionTimelineProps> = ({ recordId }) => {
  const { t, language } = useI18n();
  const [history, setHistory] = useState<MedicineHistoryItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [filterChangesOnly, setFilterChangesOnly] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(false);

    fetch(`/data/history/${recordId}.json`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`History not found: ${res.status}`);
        }
        return res.json();
      })
      .then((data: MedicineHistoryItem) => {
        if (isMounted) {
          setHistory(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [recordId]);

  if (loading) {
    return (
      <section className="p-6 rounded-2xl bg-surface-container-low/60 border border-outline-variant/30 space-y-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-primary animate-spin">
            progress_activity
          </span>
          <h2 className="font-bold text-base text-on-surface">{t.sectionTimeline}</h2>
        </div>
        <p className="text-xs text-on-surface-variant">{t.timelineLoading}</p>
      </section>
    );
  }

  if (error || !history || !history.events || history.events.length === 0) {
    return (
      <section className="p-6 rounded-2xl bg-surface-container-low/60 border border-outline-variant/30 space-y-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-primary">history_edu</span>
          <h2 className="font-bold text-base text-on-surface">{t.sectionTimeline}</h2>
        </div>
        <p className="text-xs text-on-surface-variant italic">
          {error ? t.timelineError : t.timelineNoData}
        </p>
      </section>
    );
  }

  // Calculate dynamic stats
  const hasModifications = history.events.some(
    (e) => e.type === 'FIELD_MODIFICATION' || e.type === 'STATUS_CHANGE'
  );

  const displayedEvents = filterChangesOnly
    ? history.events.filter(
        (e) =>
          e.type === 'FIELD_MODIFICATION' ||
          e.type === 'STATUS_CHANGE' ||
          e.type === 'WITHDRAWAL' ||
          e.type === 'INITIAL_REGISTRATION'
      )
    : history.events;

  const getEventIcon = (event: TimelineEvent) => {
    switch (event.type) {
      case 'INITIAL_REGISTRATION':
        return 'verified';
      case 'APPEARED':
        return 'history';
      case 'STATUS_CHANGE':
        return 'sync_alt';
      case 'FIELD_MODIFICATION':
        return 'edit_note';
      case 'WITHDRAWAL':
        return 'do_not_disturb_on';
      case 'CONFIRMED':
        return 'check_circle';
      default:
        return 'fiber_manual_record';
    }
  };

  const getEventBadgeClass = (event: TimelineEvent) => {
    switch (event.type) {
      case 'INITIAL_REGISTRATION':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'APPEARED':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'STATUS_CHANGE':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'FIELD_MODIFICATION':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'WITHDRAWAL':
        return 'bg-red-50 text-red-800 border-red-300';
      case 'CONFIRMED':
        return 'bg-surface-container text-on-surface-variant border-outline-variant/40';
      default:
        return 'bg-surface-container-high text-on-surface-variant border-outline-variant/30';
    }
  };

  return (
    <section
      aria-label={t.sectionTimeline}
      className="p-5 sm:p-6 rounded-2xl bg-surface-container-low/60 border border-outline-variant/30 space-y-6"
    >
      {/* Header and Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/20 pb-4">
        <div>
          <h2 className="font-bold text-base sm:text-lg text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px] text-primary">history_edu</span>
            <span>{t.sectionTimeline}</span>
          </h2>
          <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
            {t.timelineIntro}
          </p>
        </div>

        {/* Filter Pill */}
        {hasModifications && (
          <div className="inline-flex rounded-lg border border-outline-variant/40 p-0.5 bg-surface-container shrink-0 self-start sm:self-auto text-xs">
            <button
              type="button"
              onClick={() => setFilterChangesOnly(false)}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                !filterChangesOnly
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {t.timelineFilterAll}
            </button>
            <button
              type="button"
              onClick={() => setFilterChangesOnly(true)}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                filterChangesOnly
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {t.timelineFilterChangesOnly}
            </button>
          </div>
        )}
      </div>

      {/* Timeline track */}
      <div className="relative pl-6 sm:pl-8 rtl:pl-0 rtl:pr-6 sm:rtl:pr-8 space-y-8 before:absolute before:top-2 before:bottom-2 before:left-[11px] sm:before:left-[15px] rtl:before:left-auto rtl:before:right-[11px] sm:rtl:before:right-[15px] before:w-[2px] before:bg-outline-variant/40">
        {displayedEvents.map((event, idx) => {
          const badgeLabel = language === 'ar' ? event.badgeLabelAr : event.badgeLabelFr;
          const title = language === 'ar' ? event.titleAr : event.titleFr;

          return (
            <div key={`${event.editionId}-${idx}`} className="relative group">
              {/* Timeline Node Dot/Icon */}
              <div
                className={`absolute -left-[30px] sm:-left-[35px] rtl:-left-auto rtl:-right-[30px] sm:rtl:-right-[35px] top-0.5 w-6 sm:w-7 h-6 sm:h-7 rounded-full border-2 flex items-center justify-center transition-transform group-hover:scale-110 ${
                  event.type === 'WITHDRAWAL'
                    ? 'border-red-400 bg-red-50 text-red-700'
                    : event.type === 'FIELD_MODIFICATION'
                    ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                    : event.type === 'STATUS_CHANGE'
                    ? 'border-amber-400 bg-amber-50 text-amber-700'
                    : event.type === 'INITIAL_REGISTRATION'
                    ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                    : 'border-primary/40 bg-surface-container-high text-primary'
                }`}
              >
                <span className="material-symbols-outlined text-[14px] sm:text-[16px]">
                  {getEventIcon(event)}
                </span>
              </div>

              {/* Event Content Box */}
              <div className="bg-surface-container rounded-xl p-4 sm:p-5 border border-outline-variant/20 shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-xs sm:text-sm text-on-surface">
                      {event.editionLabel}
                    </span>
                    <span
                      className={`text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full border ${getEventBadgeClass(
                        event
                      )}`}
                    >
                      {badgeLabel}
                    </span>
                  </div>
                  {event.editionDate && (
                    <span className="text-[11px] font-mono text-on-surface-variant/80">
                      {event.editionDate}
                    </span>
                  )}
                </div>

                <p className="text-xs text-on-surface leading-relaxed font-medium">{title}</p>

                {/* Diff table if fields were modified */}
                {event.changes && event.changes.length > 0 && (
                  <div className="mt-3 overflow-hidden rounded-lg border border-outline-variant/30 bg-surface text-xs">
                    <div className="bg-surface-container-high px-3 py-1.5 font-semibold text-[11px] text-on-surface-variant flex items-center gap-1.5 border-b border-outline-variant/30">
                      <span className="material-symbols-outlined text-[14px]">tune</span>
                      <span>
                        {language === 'ar' ? 'التعديلات المسجلة' : 'Modifications enregistrées'}
                      </span>
                    </div>
                    <div className="divide-y divide-outline-variant/20">
                      {event.changes.map((change, cIdx) => (
                        <div key={cIdx} className="p-2.5 sm:p-3 space-y-1.5">
                          <span className="font-semibold text-primary block">
                            {language === 'ar' ? change.labelAr : change.labelFr}
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                            <div className="p-2 rounded bg-red-50/70 border border-red-200/60 text-red-900">
                              <span className="block text-[10px] font-medium text-red-700/80 uppercase tracking-wide">
                                {t.timelineFieldOld}
                              </span>
                              <span className="line-through">{change.oldValue || '—'}</span>
                            </div>
                            <div className="p-2 rounded bg-emerald-50/70 border border-emerald-200/60 text-emerald-900">
                              <span className="block text-[10px] font-medium text-emerald-700/80 uppercase tracking-wide">
                                {t.timelineFieldNew}
                              </span>
                              <span className="font-semibold">{change.newValue || '—'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Event Details KV */}
                {event.details && (
                  <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-2 border-t border-outline-variant/15 text-[11px]">
                    {Object.entries(event.details).map(([key, val]) => (
                      <div key={key}>
                        <dt className="text-on-surface-variant font-medium">{key}</dt>
                        <dd className="font-semibold text-on-surface truncate">{val || '—'}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
