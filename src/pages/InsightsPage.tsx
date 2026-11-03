import React from 'react';
import {
  Factory,
  TrendingUp,
  Lock,
  Building2,
  ExternalLink,
  Sparkles,
  AlertCircle,
  Database,
  Pill,
  Linkedin,
  Globe,
  Mail,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useI18n } from '@/context/I18nContext';
import { translations } from '@/locales/dictionary';
import previewDataRaw from '@/data/b2b-insights-preview.json';
import type { B2BInsightsPreviewData } from '../../scripts/generate-b2b-full-report';

const previewData = previewDataRaw as unknown as B2BInsightsPreviewData;

export const InsightsPage: React.FC = () => {
  const { language } = useI18n();
  const isAr = language === 'ar';
  const t = translations[language];

  const kpis = previewData.headlineKpis;
  const p1 = previewData.therapeuticSovereigntyPreview;
  const p2 = previewData.importOnlyTargetsPreview;
  const p3 = previewData.laboratoriesBenchmarkingPreview;
  const p4 = previewData.galenicFormsImportDependencyPreview;
  const partner = previewData.partnerInfo;

  return (
    <main
      className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* 1. Header & Hero Teaser */}
      <section className="flex flex-col gap-4 border-b border-outline-variant/30 pb-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            {t.insightsTeaserBadge}
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-surface-container text-on-surface-variant border border-outline-variant/30">
            <Database className="w-3 h-3 text-primary" aria-hidden="true" />
            {t.insightsSnapshotNote}
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-on-surface tracking-tight">
              {t.insightsTitle}
            </h1>
            <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
              {t.insightsSubtitle}
            </p>
          </div>

          <a
            href={partner.advisorWebsite}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs sm:text-sm shadow-sm transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span>{t.insightsCtaButtonPrimary}</span>
            <ExternalLink className="w-4 h-4 opacity-80" aria-hidden="true" />
          </a>
        </div>
      </section>

      {/* 2. Key Headline Metrics (KPI Grid) */}
      <section aria-labelledby="kpis-heading" className="space-y-3">
        <h2 id="kpis-heading" className="sr-only">
          Indicateurs Clés
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* Card 1: Active AMMs */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 flex flex-col justify-between shadow-2xs hover:border-primary/40 transition-all">
            <span className="text-[11px] font-medium text-on-surface-variant line-clamp-2">
              {t.insightsKpiActiveLabel}
            </span>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-primary">
                {kpis.activeRecords.toLocaleString()}
              </span>
              <span className="text-[10px] text-outline font-semibold">/ 9 595</span>
            </div>
            <span className="text-[10px] text-on-surface-variant/80 mt-1">
              {isAr ? 'مدونة أوت 2026' : 'Août 2026'}
            </span>
          </div>

          {/* Card 2: Local Manufacturing % */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 flex flex-col justify-between shadow-2xs hover:border-primary/40 transition-all">
            <span className="text-[11px] font-medium text-on-surface-variant line-clamp-2">
              {t.insightsKpiLocalPct}
            </span>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {kpis.localManufacturingPct}%
              </span>
            </div>
            <span className="text-[10px] text-on-surface-variant/80 mt-1">
              {isAr ? 'مقابل 25.8% استيراد' : 'vs 25.8% Importation'}
            </span>
          </div>

          {/* Card 3: 100% Import-Only DCIs */}
          <div className="bg-surface-container-lowest border border-amber-500/20 bg-amber-50/20 dark:bg-amber-950/10 rounded-xl p-4 flex flex-col justify-between shadow-2xs hover:border-amber-500/40 transition-all">
            <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 line-clamp-2">
              {t.insightsKpiImportOnly}
            </span>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                {kpis.importOnlyDcisCount}
              </span>
              <span className="text-[10px] text-outline font-semibold">DCI</span>
            </div>
            <span className="text-[10px] text-amber-700/80 dark:text-amber-400/80 mt-1 font-medium">
              {isAr ? 'فرص استبدال محلي' : 'Cibles R&D & Substitution'}
            </span>
          </div>

          {/* Card 4: Monopoly DCIs */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 flex flex-col justify-between shadow-2xs hover:border-primary/40 transition-all">
            <span className="text-[11px] font-medium text-on-surface-variant line-clamp-2">
              {t.insightsKpiMonopolies}
            </span>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-on-surface">
                {kpis.monopolyDcisCount}
              </span>
              <span className="text-[10px] text-outline font-semibold">DCI</span>
            </div>
            <span className="text-[10px] text-on-surface-variant/80 mt-1">
              {isAr ? 'منتج وحيد مسجل' : 'Spécialité unique active'}
            </span>
          </div>

          {/* Card 5: Orphaned DCIs */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 flex flex-col justify-between shadow-2xs hover:border-primary/40 transition-all">
            <span className="text-[11px] font-medium text-on-surface-variant line-clamp-2">
              {t.insightsKpiOrphaned}
            </span>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400">
                {kpis.orphanedDcisCount}
              </span>
              <span className="text-[10px] text-outline font-semibold">DCI</span>
            </div>
            <span className="text-[10px] text-on-surface-variant/80 mt-1">
              {isAr ? 'أدوية مسحوبة وغير متوفرة' : 'Retraits sans substitut actif'}
            </span>
          </div>

          {/* Card 6: Monitored Laboratories */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 flex flex-col justify-between shadow-2xs hover:border-primary/40 transition-all">
            <span className="text-[11px] font-medium text-on-surface-variant line-clamp-2">
              {t.insightsKpiLabs}
            </span>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-on-surface">
                {kpis.activeLaboratoriesCount}
              </span>
              <span className="text-[10px] text-outline font-semibold">
                ({kpis.participatingCountriesCount} {isAr ? 'بلداً' : 'pays'})
              </span>
            </div>
            <span className="text-[10px] text-on-surface-variant/80 mt-1">
              {isAr ? '1 712 حركة رخص محددة' : '1 712 transferts répertoriés'}
            </span>
          </div>
        </div>
      </section>

      {/* 3. Pillar 1: Industrial Sovereignty & Import Substitution */}
      <section className="bg-surface-container-low/50 border border-outline-variant/30 rounded-2xl p-5 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/20 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Factory className="w-5 h-5 text-primary" aria-hidden="true" />
              <h2 className="text-lg sm:text-xl font-bold text-on-surface">
                {t.insightsPillar1Title}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-on-surface-variant">
              {t.insightsPillar1Subtitle}
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-surface-container text-primary border border-outline-variant/30 self-start sm:self-auto">
            {isAr ? '28 فئة علاجية مدققة' : '28 classes thérapeutiques auditées'}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Local Autonomy Classes */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              {t.insightsPillar1TopLocal}
            </h3>
            <div className="space-y-2.5">
              {p1.topLocalClasses.map((c) => (
                <div
                  key={c.code}
                  className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-3 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-on-surface truncate">
                      {isAr ? c.nameAr : c.nameFr}
                    </span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400 shrink-0">
                      {c.localPct}% {isAr ? 'محلي' : 'Local'} ({c.localCount}/{c.totalActive})
                    </span>
                  </div>
                  <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${c.localPct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Import-Dependent Classes */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              {t.insightsPillar1TopImport}
            </h3>
            <div className="space-y-2.5">
              {p1.topImportDependentClasses.map((c) => (
                <div
                  key={c.code}
                  className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-3 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-on-surface truncate">
                      {isAr ? c.nameAr : c.nameFr}
                    </span>
                    <span className="font-extrabold text-rose-600 dark:text-rose-400 shrink-0">
                      {c.importPct}% {isAr ? 'استيراد' : 'Import'} ({c.importCount}/{c.totalActive})
                    </span>
                  </div>
                  <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-rose-500 rounded-full"
                      style={{ width: `${c.importPct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                    <span>
                      {c.hopOnlyPct > 0
                        ? `${c.hopOnlyPct}% ${isAr ? 'استعمال حصري بالمستشفيات' : 'Usage exclusif hospitalier'}`
                        : `${isAr ? 'صرف مشترك' : 'Mixte Officine / Hôpital'}`}
                    </span>
                    <span className="text-outline">Code: {c.code}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Locking Banner for Pillar 1 */}
        <div className="relative overflow-hidden border border-dashed border-outline-variant/60 rounded-xl p-4 bg-surface-container-low/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-on-surface">
                +{p1.lockedRemainingClassesCount} {isAr ? 'فئات علاجية إضافية مع التحليل الكامل' : 'autres classes thérapeutiques détaillées dans le rapport complet'}
              </p>
              <p className="text-[11px] text-on-surface-variant">
                {t.insightsLockedSub}
              </p>
            </div>
          </div>
          <a
            href={partner.advisorWebsite}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-xs font-semibold text-primary transition-colors shrink-0"
          >
            <span>{t.insightsLockedBadge}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </section>

      {/* 4. Pillar 2: R&D & Licensing Opportunities (The 493 Import-Only DCIs) */}
      <section className="bg-surface-container-low/50 border border-outline-variant/30 rounded-2xl p-5 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/20 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              <h2 className="text-lg sm:text-xl font-bold text-on-surface">
                {t.insightsPillar2Title}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-on-surface-variant">
              {t.insightsPillar2Subtitle}
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 self-start sm:self-auto">
            {kpis.importOnlyDcisCount} {isAr ? 'مادة 100% استيراد' : 'DCI 100% Importées'}
          </span>
        </div>

        {/* Teaser Table */}
        <div className="overflow-x-auto rounded-xl border border-outline-variant/20 bg-surface-container-lowest">
          <table className="w-full text-start text-xs">
            <thead className="bg-surface-container text-on-surface-variant font-semibold border-b border-outline-variant/20">
              <tr>
                <th className="py-2.5 px-3 text-start">{t.insightsTableDci}</th>
                <th className="py-2.5 px-3 text-start">{t.insightsTableClass}</th>
                <th className="py-2.5 px-3 text-start">{t.insightsTableForms}</th>
                <th className="py-2.5 px-3 text-start">{t.insightsTableLabs}</th>
                <th className="py-2.5 px-3 text-center">{t.insightsTableActiveAmms}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/15 text-on-surface">
              {p2.sampleMolecules.map((m) => (
                <tr key={m.dci} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-primary">{m.dci}</td>
                  <td className="py-2.5 px-3 text-on-surface-variant">
                    {m.classNameFr} ({m.classCode})
                  </td>
                  <td className="py-2.5 px-3 text-on-surface-variant">{m.forms.join(', ')}</td>
                  <td className="py-2.5 px-3 text-on-surface-variant">{m.sampleLabs.join(', ')}</td>
                  <td className="py-2.5 px-3 text-center font-bold">{m.activeCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Locking Banner for Pillar 2 */}
        <div className="relative overflow-hidden border border-dashed border-amber-500/40 rounded-xl p-4 bg-amber-50/20 dark:bg-amber-950/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-on-surface">
                +{p2.lockedRemainingDcisCount} {isAr ? 'مادة فعالة أخرى مستوردة كلياً متوفرة في التقرير الكامل' : 'autres molécules à 100% d’importation disponibles dans le rapport intégral'}
              </p>
              <p className="text-[11px] text-on-surface-variant">
                {isAr
                  ? 'يتضمن التقرير القوائم المصنفة مع هوية المخابر، التراكيز، والحماية من المنافسة عبر منع الاستيراد عند التصنيع المحلي.'
                  : 'Inclut la liste exhaustive avec laboratoires détenteurs, formes galéniques et potentiel d’interdiction d’importation.'}
              </p>
            </div>
          </div>
          <a
            href={partner.advisorWebsite}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-2xs transition-colors shrink-0"
          >
            <span>{isAr ? 'طلب القائمة كاملة' : 'Obtenir la liste intégrale'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </section>

      {/* 5. Pillar 3: Laboratory Benchmarking (Top 5 Scorecards) */}
      <section className="bg-surface-container-low/50 border border-outline-variant/30 rounded-2xl p-5 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/20 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" aria-hidden="true" />
              <h2 className="text-lg sm:text-xl font-bold text-on-surface">
                {t.insightsPillar3Title}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-on-surface-variant">
              {t.insightsPillar3Subtitle}
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-surface-container text-primary border border-outline-variant/30 self-start sm:self-auto">
            {kpis.activeLaboratoriesCount} {isAr ? 'مخبراً مسجلاً' : 'laboratoires audités'}
          </span>
        </div>

        {/* Labs Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {p3.topPlayers.map((lab) => (
            <div
              key={lab.name}
              className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-3.5 flex flex-col justify-between space-y-3 hover:border-primary/40 transition-all shadow-2xs"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                  #{lab.rank} {isAr ? 'الترتيب' : 'Rang'}
                </span>
                <h3 className="font-extrabold text-xs text-on-surface line-clamp-2 leading-snug">
                  {lab.name}
                </h3>
              </div>

              <div className="space-y-1.5 text-[11px] pt-2 border-t border-outline-variant/15">
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">{t.insightsTableActiveAmms} :</span>
                  <span className="font-bold text-on-surface">{lab.activeAmms}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">{isAr ? 'DCI فريدة :' : 'DCI uniques :'}</span>
                  <span className="font-bold text-on-surface">{lab.uniqueDcis}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">{t.insightsTableLocalPct} :</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {lab.localPct}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">{t.insightsTableBiologics} :</span>
                  <span className="font-semibold text-on-surface">{lab.biologicsCount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Locking Banner for Pillar 3 */}
        <div className="relative overflow-hidden border border-dashed border-outline-variant/60 rounded-xl p-4 bg-surface-container-low/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-on-surface">
                +{p3.lockedRemainingLabsCount} {isAr ? 'مخبراً إضافياً مصنفاً مع مؤشرات الأداء والانسحاب' : 'autres laboratoires classés avec scorecards détaillées et taux d’attrition'}
              </p>
              <p className="text-[11px] text-on-surface-variant">
                {isAr
                  ? 'يتضمن التقرير تتبع 1 712 عملية تحويل للمخابر الحائزة وتفاصيل الشراكات الدولية.'
                  : 'Historique des transferts de licence, partenariats internationaux et rotation de portefeuille.'}
              </p>
            </div>
          </div>
          <a
            href={partner.advisorWebsite}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-xs font-semibold text-primary transition-colors shrink-0"
          >
            <span>{t.insightsLockedBadge}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </section>

      {/* 6. Pillar 4: Galenic Forms Dependency */}
      <section className="bg-surface-container-low/50 border border-outline-variant/30 rounded-2xl p-5 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/20 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-primary" aria-hidden="true" />
              <h2 className="text-lg sm:text-xl font-bold text-on-surface">
                {t.insightsPillar4Title}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-on-surface-variant">
              {t.insightsPillar4Subtitle}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {p4.highImportForms.map((f) => (
            <div
              key={f.form}
              className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-3.5 flex flex-col justify-between space-y-2 shadow-2xs"
            >
              <h3 className="font-bold text-xs text-on-surface line-clamp-2">
                {f.form}
              </h3>
              <div className="pt-2 border-t border-outline-variant/15 flex items-baseline justify-between">
                <span className="text-[11px] text-on-surface-variant">
                  {isAr ? 'التبعية :' : 'Import :'}
                </span>
                <span className="text-base font-extrabold text-rose-600 dark:text-rose-400">
                  {f.importPct}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. The Master B2B TechWise Advisors Conversion Banner */}
      <section className="relative overflow-hidden rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-surface-container-lowest via-surface-container-low to-primary/5 p-6 sm:p-10 shadow-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-3">
              <img
                src="/images/techwise-advisors-logo.png"
                alt="TechWise Advisors"
                className="w-12 h-12 object-contain rounded-xl bg-white p-1 border border-outline-variant/30 shadow-xs"
              />
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                  TechWise Advisors DZ
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-on-surface leading-tight">
                  {t.insightsCtaTitle}
                </h2>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              {t.insightsCtaDesc}
            </p>

            {/* Core Deliverables Checkmarks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs font-medium text-on-surface">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{t.insightsCtaFeature1}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{t.insightsCtaFeature2}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{t.insightsCtaFeature3}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{t.insightsCtaFeature4}</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto shrink-0">
            <a
              href={partner.advisorWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-sm shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Globe className="w-4 h-4" />
              <span>{t.insightsCtaButtonPrimary}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>

            <a
              href={partner.advisorLinkedIn}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-on-surface font-semibold text-xs sm:text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Linkedin className="w-4 h-4 text-[#0A66C2]" />
              <span>{t.insightsCtaButtonLinkedIn}</span>
              <ExternalLink className="w-3.5 h-3.5 text-outline" />
            </a>

            <div className="flex items-center justify-center gap-2 text-[11px] text-on-surface-variant pt-1">
              <Mail className="w-3.5 h-3.5 text-primary" />
              <a
                href={`mailto:${partner.advisorEmail}?subject=Demande%20Rapport%20B2B%20PharmaSearch`}
                className="underline hover:text-primary transition-colors"
              >
                {partner.advisorEmail}
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default InsightsPage;
