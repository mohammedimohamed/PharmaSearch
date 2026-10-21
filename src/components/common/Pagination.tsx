import React from 'react';
import { useI18n } from '@/context/I18nContext';
import { cn } from '@/utils/cn';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalHits: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalHits,
  pageSize,
  onPageChange,
  className,
}) => {
  const { t, isRTL } = useI18n();

  if (totalPages <= 1) {
    if (totalHits === 0) return null;
    return (
      <div className={cn('text-xs text-on-surface-variant text-center py-4', className)}>
        {t.showingResults
          .replace('{from}', '1')
          .replace('{to}', String(totalHits))
          .replace('{total}', totalHits.toLocaleString())}
      </div>
    );
  }

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalHits);

  // Generate pagination page numbers with smart ellipsis
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push('ellipsis');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('ellipsis');
      }
      pages.push(totalPages);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 border-t border-outline-variant/30 text-sm',
        className
      )}
      role="navigation"
      aria-label="Pagination"
    >
      <div className="text-xs text-on-surface-variant order-2 sm:order-1">
        {t.showingResults
          .replace('{from}', from.toLocaleString())
          .replace('{to}', to.toLocaleString())
          .replace('{total}', totalHits.toLocaleString())}
      </div>

      <div className="flex items-center gap-1 order-1 sm:order-2">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(
            'inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md border border-outline-variant/40 transition-colors',
            currentPage === 1
              ? 'opacity-40 cursor-not-allowed bg-surface-container-low text-on-surface-variant'
              : 'hover:bg-surface-container text-on-surface bg-surface-container-lowest'
          )}
          aria-label={t.previousPage}
        >
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
            {isRTL ? 'chevron_right' : 'chevron_left'}
          </span>
          <span className="hidden sm:inline">{t.previousPage}</span>
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1 px-1">
          {pages.map((p, idx) => {
            if (p === 'ellipsis') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 py-1 text-xs text-on-surface-variant select-none"
                >
                  …
                </span>
              );
            }

            const isCurrent = p === currentPage;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={cn(
                  'min-w-[32px] h-8 flex items-center justify-center text-xs font-medium rounded-md transition-colors',
                  isCurrent
                    ? 'bg-primary text-on-primary font-semibold shadow-sm'
                    : 'text-on-surface hover:bg-surface-container bg-surface-container-lowest border border-outline-variant/30'
                )}
                aria-current={isCurrent ? 'page' : undefined}
                aria-label={`Page ${p}`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(
            'inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md border border-outline-variant/40 transition-colors',
            currentPage === totalPages
              ? 'opacity-40 cursor-not-allowed bg-surface-container-low text-on-surface-variant'
              : 'hover:bg-surface-container text-on-surface bg-surface-container-lowest'
          )}
          aria-label={t.nextPage}
        >
          <span className="hidden sm:inline">{t.nextPage}</span>
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
            {isRTL ? 'chevron_left' : 'chevron_right'}
          </span>
        </button>
      </div>
    </div>
  );
};
