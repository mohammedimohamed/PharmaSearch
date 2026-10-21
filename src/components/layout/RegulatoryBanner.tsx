import React from 'react';
import { ShieldCheck, Calendar } from 'lucide-react';
import { useI18n } from '@/context/I18nContext';

interface RegulatoryBannerProps {
  lang?: 'fr' | 'ar';
}

export const RegulatoryBanner: React.FC<RegulatoryBannerProps> = ({ lang }) => {
  let activeLang: 'fr' | 'ar' = lang ?? 'fr';

  if (!lang) {
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const i18n = useI18n();
      if (i18n?.language) {
        activeLang = i18n.language;
      }
    } catch {
      activeLang = 'fr';
    }
  }

  const isAr = activeLang === 'ar';

  return (
    <aside
      aria-label={isAr ? 'تنبيه تنظيمي رسمي' : 'Avertissement réglementaire officiel'}
      className="w-full bg-surface-container-low border-b border-outline-variant/30 text-on-surface-variant py-2 px-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
    >
      <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[12px] leading-5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
          <span>
            {isAr ? (
              <>
                <strong className="font-semibold text-on-surface">الجمهورية الجزائرية الديمقراطية الشعبية</strong> — وزارة الصناعة الصيدلانية
              </>
            ) : (
              <>
                <strong className="font-semibold text-on-surface">République Algérienne Démocratique et Populaire</strong> — Ministère de l'Industrie Pharmaceutique
              </>
            )}
          </span>
        </div>
        <div className="flex items-center gap-4 text-outline font-mono text-[11px]">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{isAr ? 'تاريخ المصدر: 31 أوت 2026' : 'Source officielle : 31 Août 2026'}</span>
          </span>
          <span className="hidden md:inline bg-surface-container px-1.5 py-0.5 rounded text-[10px] text-on-surface-variant">
            {isAr ? 'بيانات مؤكدة' : 'Instantané vérifié'}
          </span>
        </div>
      </div>
    </aside>
  );
};
