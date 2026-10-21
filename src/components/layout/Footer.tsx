import React from 'react';
import { Database, AlertTriangle, HardDrive, Globe, Linkedin, ExternalLink, Handshake } from 'lucide-react';
import { useI18n } from '@/context/I18nContext';
import { translations } from '@/locales/dictionary';

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
  const t = translations[activeLang];

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

        {/* Sponsorship & Partners Section */}
        <section aria-labelledby="footer-partners-heading" className="flex flex-col gap-3 pb-6 border-b border-outline-variant/20">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-primary rounded-full" aria-hidden="true" />
            <h3 id="footer-partners-heading" className="text-xs font-bold text-on-surface uppercase tracking-wider">
              {t.partnersSectionTitle}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: TechWise Advisors */}
            <div className="bg-surface-container-low/70 border border-outline-variant/30 rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-4 transition-all hover:border-primary/40 hover:shadow-2xs">
              <div className="flex items-start gap-3.5">
                <a
                  href="https://techwise-dz.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
                  aria-label={`${t.sponsorTitle} (${t.sponsorWebsite})`}
                >
                  <img
                    src="/images/techwise-advisors-logo.png"
                    alt={t.sponsorAltLogo}
                    className="h-11 w-11 object-contain rounded-lg bg-white p-1 border border-outline-variant/20 shadow-xs hover:border-primary/60 transition-colors"
                    width={44}
                    height={44}
                  />
                </a>
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                    {t.sponsorLabel}
                  </span>
                  <a
                    href="https://techwise-dz.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm sm:text-base font-bold text-on-surface hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded truncate"
                  >
                    TechWise Advisors
                  </a>
                  <span className="text-[11px] text-on-surface-variant font-medium mt-0.5">
                    Enterprise Systems Service
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-outline-variant/15 text-xs">
                <a
                  href="https://techwise-dz.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-medium transition-colors border border-outline-variant/30 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label={`${t.sponsorWebsite} — TechWise Advisors`}
                >
                  <Globe className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                  <span>{t.sponsorWebsite}</span>
                  <ExternalLink className="w-3 h-3 text-outline" aria-hidden="true" />
                </a>

                <a
                  href="https://www.linkedin.com/company/techwiseadvisors"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-medium transition-colors border border-outline-variant/30 hover:border-[#0A66C2]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label={`${t.sponsorLinkedIn} — TechWise Advisors`}
                >
                  <Linkedin className="w-3.5 h-3.5 text-[#0A66C2]" aria-hidden="true" />
                  <span>{t.sponsorLinkedIn}</span>
                  <ExternalLink className="w-3 h-3 text-outline" aria-hidden="true" />
                </a>
              </div>
            </div>

            {/* Card 2: Open Sponsorship Slot */}
            <div className="border-2 border-dashed border-outline-variant/50 hover:border-primary/50 bg-surface-container-lowest/50 rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-4 transition-all">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0 border border-outline-variant/20 shadow-xs">
                  <Handshake className="w-5 h-5 text-primary" aria-hidden="true" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm sm:text-base font-bold text-on-surface">
                    {t.openSlotTitle}
                  </span>
                  <p className="text-[11px] sm:text-xs text-on-surface-variant leading-relaxed mt-1">
                    {t.openSlotDesc}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-outline-variant/15">
                <p className="text-[11px] text-on-surface-variant font-medium">
                  {t.openSlotSupporting}
                </p>
                <a
                  href="https://www.linkedin.com/company/techwiseadvisors"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-xs"
                  aria-label={`${t.openSlotCta} (LinkedIn)`}
                >
                  <Linkedin className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{t.openSlotCta}</span>
                  <ExternalLink className="w-3 h-3 text-on-primary/80" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-outline">
          <p>© 2026 PharmaSearch DZ — Utilité publique de consultation pharmaceutique.</p>
          <div className="flex items-center gap-4">
            <span>Version 1.0.0</span>
            <span>•</span>
            <span>Instantané : 31/08/2026</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
