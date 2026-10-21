import React from 'react';
import type { SourceListType } from '@/types';
import { cn } from '@/utils/cn';

export interface StatusBadgeProps {
  sourceList: SourceListType;
  className?: string;
  lang?: 'fr' | 'ar';
}

const statusConfig: Record<
  SourceListType,
  {
    labelFr: string;
    labelAr: string;
    classes: string;
    dotColor: string;
  }
> = {
  NOMENCLATURE_ACTIVE: {
    labelFr: 'Actif',
    labelAr: 'نشط',
    classes: 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]',
    dotColor: 'bg-emerald-600',
  },
  NON_RENOUVELE: {
    labelFr: 'Non renouvelé',
    labelAr: 'غير مجدد',
    classes: 'bg-[#FEF3C7] text-[#B45309] border-[#FCD34D]',
    dotColor: 'bg-amber-600',
  },
  RETRAIT: {
    labelFr: 'Retiré',
    labelAr: 'مسحوب',
    classes: 'bg-[#FEE2E2] text-[#B91C1C] border-[#FCA5A5]',
    dotColor: 'bg-red-600',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  sourceList,
  className,
  lang = 'fr',
}) => {
  const config = statusConfig[sourceList] || statusConfig.NOMENCLATURE_ACTIVE;
  const label = lang === 'ar' ? config.labelAr : config.labelFr;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[12px] font-medium leading-4 border select-none',
        config.classes,
        className
      )}
      role="status"
      aria-label={`Statut réglementaire: ${label}`}
    >
      <span
        aria-hidden="true"
        className={cn('inline-block w-1.5 h-1.5 rounded-full', config.dotColor)}
      />
      <span>{label}</span>
    </span>
  );
};
