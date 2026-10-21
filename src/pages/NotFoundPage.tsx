import React from 'react';
import { useI18n } from '@/context/I18nContext';
import { useRouter } from '@/router/RouterContext';

export const NotFoundPage: React.FC = () => {
  const { t, isRTL } = useI18n();
  const { navigate } = useRouter();

  return (
    <main className="w-full max-w-[600px] mx-auto px-4 py-20 text-center flex-1 flex flex-col items-center justify-center">
      <div className="p-8 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm space-y-4 w-full">
        <div className="w-16 h-16 mx-auto rounded-full bg-surface-container flex items-center justify-center text-outline">
          <span className="material-symbols-outlined text-3xl">wrong_location</span>
        </div>
        <h1 className="text-xl font-bold text-on-surface">Page introuvable</h1>
        <p className="text-xs sm:text-sm text-on-surface-variant">
          La page que vous recherchez n'existe pas ou l'adresse a été modifiée.
        </p>
        <div className="pt-2">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-lg text-xs font-semibold shadow-sm hover:bg-primary-container transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isRTL ? 'arrow_forward' : 'arrow_back'}
            </span>
            <span>{t.navHome}</span>
          </button>
        </div>
      </div>
    </main>
  );
};
