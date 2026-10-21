import React from 'react';
import { Database, AlertTriangle, HardDrive } from 'lucide-react';
import { useI18n } from '@/context/I18nContext';

interface FooterProps {
  lang?: 'fr' | 'ar';
}

export const Footer: React.FC<FooterProps> = ({ lang }) => {
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
    <footer className="w-full bg-surface-container-lowest border-t border-outline-variant/40 mt-auto py-8 px-4 text-xs text-on-surface-variant">
      <div className="max-w-[1280px] mx-auto flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-outline-variant/20">
          {/* Provenance */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 font-semibold text-on-surface">
              <Database className="w-4 h-4 text-primary" aria-hidden="true" />
              <span>{isAr ? 'مصدر البيانات المعتمد' : 'Provenance des Données'}</span>
            </div>
            <p className="text-[12px] leading-relaxed">
              {isAr
                ? 'مأخوذة مباشرة من المصنف الرسمي الصادر عن وزارة الصناعة الصيدلانية (مديرية الاقتصاد الدوائي والأنشطة الصيدلانية والتنظيم) المؤرخ في 31 أوت 2026.'
                : "Extrait directement du classeur officiel du Ministère de l'Industrie Pharmaceutique (Direction de la Pharmaco-Économie, des Activités Pharmaceutiques et de la Régulation) arrêté au 31 Août 2026."}
            </p>
          </div>

          {/* Legal Notice */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 font-semibold text-on-surface">
              <AlertTriangle className="w-4 h-4 text-amber-600" aria-hidden="true" />
              <span>{isAr ? 'تنبيه تنظيمي واستعمالي' : 'Avertissement Réglementaire'}</span>
            </div>
            <p className="text-[12px] leading-relaxed">
              {isAr
                ? 'يعكس هذا الموقع التصنيف الرسمي المسجل في القوائم المرجعية. إدراج أي دواء لا يضمن توفره الفعلي في الصيدليات، ويجب استشارة الطبيب أو الصيدلي دائماً.'
                : "La présence d'un produit dans la nomenclature officielle reflète son statut administratif au 31/08/2026 et ne constitue pas une garantie de disponibilité commerciale en officine. Consultez toujours un professionnel de santé."}
            </p>
          </div>

          {/* Local Storage */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 font-semibold text-on-surface">
              <HardDrive className="w-4 h-4 text-secondary" aria-hidden="true" />
              <span>{isAr ? 'الخصوصية والتخزين المحلي' : 'Stockage Local & Confidentialité'}</span>
            </div>
            <p className="text-[12px] leading-relaxed">
              {isAr
                ? 'يتم حفظ التفضيلات والأسماء المستعارة محلياً في متصفحك فقط، ولا يتم إرسالها إلى أي خادم خارجي أو مزامنتها تلقائياً بين أجهزتك.'
                : 'Vos favoris et alias personnalisés sont conservés exclusivement sur votre appareil (stockage local du navigateur). Aucune donnée utilisateur ne transite vers un serveur distant.'}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-outline">
          <p>© 2026 PharmaSearch DZ — Utilité publique de consultation pharmaceutique.</p>
          <div className="flex items-center gap-4">
            <span>Version 1.0.0 (Stage 4)</span>
            <span>•</span>
            <span>Instantané : 31/08/2026</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
