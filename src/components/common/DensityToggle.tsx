import React from 'react';
import { useFavourites, type DensityMode } from '@/context/FavouritesContext';
import { useI18n } from '@/context/I18nContext';
import { cn } from '@/utils/cn';

export const DensityToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { densityMode, setDensityMode } = useFavourites();
  const { t } = useI18n();

  const options: Array<{ mode: DensityMode; label: string; icon: string }> = [
    { mode: 'compact', label: t.densityCompact, icon: 'density_small' },
    { mode: 'standard', label: t.densityStandard, icon: 'view_agenda' },
    { mode: 'comfortable', label: t.densityComfortable, icon: 'view_day' },
  ];

  return (
    <div
      className={cn(
        'inline-flex items-center p-1 bg-surface-container-low rounded-lg border border-outline-variant/40',
        className
      )}
      role="group"
      aria-label={t.densitySectionTitle}
    >
      <span className="text-xs text-on-surface-variant font-medium px-2 hidden lg:inline shrink-0">
        {t.viewDensity}:
      </span>
      <div className="flex items-center gap-1 w-full sm:w-auto">
        {options.map((opt) => {
          const isActive = densityMode === opt.mode;
          return (
            <button
              key={opt.mode}
              type="button"
              onClick={() => setDensityMode(opt.mode)}
              className={cn(
                'flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors duration-150 min-h-[32px] cursor-pointer',
                isActive
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              )}
              title={opt.label}
              aria-label={opt.label}
              aria-pressed={isActive}
            >
              <span className="material-symbols-outlined text-[16px] leading-none shrink-0" aria-hidden="true">
                {opt.icon}
              </span>
              <span className="hidden xl:inline">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
