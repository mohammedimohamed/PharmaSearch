export type Language = 'fr' | 'ar';

export interface TranslationDictionary {
  // Navigation & Branding
  appName: string;
  appBadge: string;
  appSubtitle: string;
  navHome: string;
  navRegistry: string;
  navFavourites: string;
  navProvenance: string;

  // Banner & Provenance
  officialRepublic: string;
  officialMinistry: string;
  officialDirection: string;
  sourceSnapshotLabel: string;
  sourceSnapshotDate: string;
  verifiedSnapshotBadge: string;
  provenanceNotice: string;
  legalDisclaimer: string;
  localStorageNotice: string;
  footerCopyright: string;

  // Status Badges
  statusActive: string;
  statusNonRenewed: string;
  statusWithdrawn: string;
  statusFabricationLocale: string;
  statusImportation: string;
  typeGeneric: string;
  typeReference: string;
  typeBiosimilar: string;

  // Home Page
  heroEditionBadge: string;
  heroTitlePrefix: string;
  heroTitleHighlight: string;
  heroSubtitle: string;
  searchPlaceholder: string;
  searchButton: string;
  searchExamplesLabel: string;
  searchExamples: string;
  sourceListsTitle: string;
  sourceListsSubtitle: string;
  totalSourceRowsBadge: string;
  list1Title: string;
  list1Desc: string;
  list1CountLabel: string;
  list2Title: string;
  list2Desc: string;
  list2CountLabel: string;
  list3Title: string;
  list3Desc: string;
  list3CountLabel: string;
  densitySectionTitle: string;
  densitySectionSubtitle: string;

  // Search & Results Page
  searchPageTitle: string;
  breadcrumbHome: string;
  breadcrumbRegistry: string;
  breadcrumbSearch: string;
  breadcrumbDetail: string;
  resultsCount: string;
  resultsCountZero: string;
  allMedicinesHeadline: string;
  filtersHeader: string;
  filtersReset: string;
  filterStatusLabel: string;
  filterFormLabel: string;
  filterLaboratoryLabel: string;
  filterCountryLabel: string;
  filterClassificationLabel: string;
  filterOriginLabel: string;
  filterChannelsLabel: string;
  filterHospitalOnly: string;
  filterOfficineOnly: string;
  filterSearchFormPlaceholder: string;
  filterSearchLabPlaceholder: string;
  sortByLabel: string;
  sortRelevance: string;
  sortBrandAsc: string;
  sortBrandDesc: string;
  sortDciAsc: string;
  sortDciDesc: string;
  sortDateDesc: string;
  sortDateAsc: string;
  densityStandard: string;
  densityCompact: string;
  densityComfortable: string;
  viewDetailsButton: string;
  emptyResultsTitle: string;
  emptyResultsDesc: string;
  emptyResultsAction: string;
  loadingMessage: string;
  errorMessage: string;
  errorRetry: string;
  discrepancyNoticeBadge: string;
  pagePrevious: string;
  pageNext: string;
  pageIndicator: string;

  // Detail Page
  backToResults: string;
  copyLink: string;
  linkCopied: string;
  favouriteAdd: string;
  favouriteRemove: string;
  personalAliasLabel: string;
  personalAliasPlaceholder: string;
  personalAliasSave: string;
  personalAliasDelete: string;
  personalAliasActive: string;
  presentationSectionTitle: string;
  otherPresentationsTitle: string;
  otherPresentationsSubtitle: string;
  historySectionTitle: string;
  discrepancyCardTitle: string;
  discrepancyCardDesc: string;
  discrepancyViewLink: string;
  fieldBrand: string;
  fieldDci: string;
  fieldForm: string;
  fieldDosage: string;
  fieldPackaging: string;
  fieldSchedule: string;
  fieldType: string;
  fieldLaboratory: string;
  fieldCountry: string;
  fieldRegNumber: string;
  fieldCode: string;
  fieldShelfLife: string;
  fieldOrigin: string;
  fieldHospital: string;
  fieldOfficine: string;
  fieldObservations: string;
  fieldInitialDate: string;
  fieldFinalDate: string;
  fieldWithdrawalDate: string;
  fieldWithdrawalReason: string;
  fieldSourceWorksheet: string;
  fieldSourceRow: string;
  fieldSnapshotDate: string;
  invalidDateWarning: string;
  administrativeDateNotice: string;
  yes: string;
  no: string;
  notFoundTitle: string;
  notFoundDesc: string;
  notFoundAction: string;

  // Favourites Page
  favouritesTitle: string;
  favouritesSubtitle: string;
  favouritesCount: string;
  favouritesEmptyTitle: string;
  favouritesEmptyDesc: string;
  favouritesClearAll: string;
  favouritesClearConfirm: string;
  favouritesLocalDisclaimer: string;

  // Helper & UI Keys
  viewDensity: string;
  showingResults: string;
  previousPage: string;
  nextPage: string;
  filtersTitle: string;
  resetFilters: string;
  filterSourceList: string;
  filterClassification: string;
  filterOrigin: string;
  filterDistribution: string;
  filterHospital: string;
  filterOfficine: string;
  filterForm: string;
  filterLaboratory: string;
  showMore: string;
  showLess: string;
  applyFilters: string;
  removeFromFavourites: string;
  addToFavourites: string;
  discrepancyNotice: string;
  discrepancyBadge: string;
  clearSearch: string;
  resultsFound: string;
  sortLabel: string;
  loadingData: string;
  errorLoadingData: string;
  noResultsTitle: string;
  noResultsDesc: string;
  backToSearch: string;
  discrepancyBannerTitle: string;
  discrepancyBannerDesc: string;
  discrepancyCompareAction: string;
  favSaved: string;
  editAlias: string;
  removeAlias: string;
  saveAlias: string;
  aliasLabel: string;
  aliasPlaceholder: string;
  sectionIdentification: string;
  sectionLaboratories: string;
  sectionStatusDates: string;
  sectionProvenance: string;
  fieldRegistrationNumber: string;
  fieldInitialRegDate: string;
  fieldReRegistrationDate: string;
  fieldManufacturingOrigin: string;
  relatedPresentationsTitle: string;
  relatedPresentationsDesc: string;
  viewDetails: string;

  // Code Explanations
  codeStatutLabel: string;
  codeTypeLabel: string;
  codeP1Label: string;
  codeP2Label: string;
  p1Specified: string;
  p1Unspecified: string;
  p2Specified: string;
  p2Unspecified: string;
  typeGenericDesc: string;
  typeReferenceDesc: string;
  typeBioDesc: string;
  typeUnspecified: string;
  scheduleUnspecified: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  fr: {
    appName: 'PharmaSearch',
    appBadge: 'DZ',
    appSubtitle: 'Nomenclature Nationale des Produits Pharmaceutiques',
    navHome: 'Accueil',
    navRegistry: 'Registre',
    navFavourites: 'Favoris',
    navProvenance: 'Source & Traçabilité',

    officialRepublic: 'République Algérienne Démocratique et Populaire',
    officialMinistry: "Ministère de l'Industrie Pharmaceutique",
    officialDirection: 'Direction de la Pharmaco-Économie, des Activités Pharmaceutiques et de la Régulation',
    sourceSnapshotLabel: 'Source officielle',
    sourceSnapshotDate: '31 Août 2026',
    verifiedSnapshotBadge: 'Instantané vérifié',
    provenanceNotice: "Extrait directement du classeur officiel du Ministère de l'Industrie Pharmaceutique arrêté au 31 Août 2026.",
    legalDisclaimer: "La présence d'un produit dans la nomenclature officielle reflète son statut administratif au 31/08/2026 et ne constitue pas une garantie de disponibilité commerciale en officine. Consultez toujours un professionnel de santé.",
    localStorageNotice: 'Vos favoris et alias personnalisés sont conservés exclusivement sur votre appareil (stockage local du navigateur). Aucune donnée utilisateur ne transite vers un serveur distant.',
    footerCopyright: '© 2026 PharmaSearch DZ — Utilité publique de consultation pharmaceutique.',

    statusActive: 'Actif',
    statusNonRenewed: 'Non renouvelé',
    statusWithdrawn: 'Retiré',
    statusFabricationLocale: 'Fabrication locale (F)',
    statusImportation: 'Importation (I)',
    typeGeneric: 'Générique (GE)',
    typeReference: 'Princeps / Référence (RE)',
    typeBiosimilar: 'Biologique (BIO)',

    heroEditionBadge: 'Référentiel Pharmaceutique Officiel — Édition Août 2026',
    heroTitlePrefix: 'Consulter la',
    heroTitleHighlight: 'Nomenclature Nationale',
    heroSubtitle: "Outil institutionnel de recherche et de consultation des spécialités pharmaceutiques à usage humain, statuts réglementaires, DCI, dosages et laboratoires d'Algérie.",
    searchPlaceholder: 'Rechercher par marque, DCI, n° enregistrement, code ou laboratoire...',
    searchButton: 'Rechercher',
    searchExamplesLabel: 'Exemples fréquents :',
    searchExamples: 'CETIRIZINE, PARACETAMOL, ARTIZ, SAIDAL, EL KENDI, 352/01 A 003/06/22',
    sourceListsTitle: 'Les Trois Registres Sources Officiels',
    sourceListsSubtitle: 'Chaque registre source est préservé de manière distincte sans fusion destructrice.',
    totalSourceRowsBadge: 'Total source cumulé : 9 595 enregistrements',
    list1Title: 'Nomenclature Nationale 31 Août 2026',
    list1Desc: 'Spécialités enregistrées et validées figurant dans la nomenclature nationale officielle.',
    list1CountLabel: 'lignes actives',
    list2Title: 'Produits Non Renouvelés',
    list2Desc: "Produits pharmaceutiques n'ayant pas fait l'objet de renouvellement d'enregistrement.",
    list2CountLabel: 'lignes non renouvelées',
    list3Title: 'Produits Faisant l’Objet de Retrait',
    list3Desc: "Médicaments retirés du registre avec motif administratif (commercial, sécurité) et date.",
    list3CountLabel: 'lignes retirées',
    densitySectionTitle: "Modes de densité d'affichage",
    densitySectionSubtitle: 'Conforme aux gabarits du design system : Standard, Compact spécialistes, et Confort de lecture.',

    searchPageTitle: 'Registre Pharmaceutique — Recherche',
    breadcrumbHome: 'Accueil',
    breadcrumbRegistry: 'Registre',
    breadcrumbSearch: 'Recherche',
    breadcrumbDetail: 'Détail produit',
    resultsCount: 'spécialité(s) pharmaceutique(s) trouvée(s)',
    resultsCountZero: 'Aucune spécialité trouvée',
    allMedicinesHeadline: 'Tous les médicaments du registre',
    filtersHeader: 'Filtres de recherche',
    filtersReset: 'Réinitialiser',
    filterStatusLabel: "Statut d'enregistrement",
    filterFormLabel: 'Forme pharmaceutique',
    filterLaboratoryLabel: 'Laboratoire détenteur',
    filterCountryLabel: 'Pays du laboratoire',
    filterClassificationLabel: 'Classification (Type)',
    filterOriginLabel: 'Origine de fabrication',
    filterChannelsLabel: 'Canaux de délivrance',
    filterHospitalOnly: 'Usage hospitalier (HOP)',
    filterOfficineOnly: 'Délivrance en officine (OFF)',
    filterSearchFormPlaceholder: 'Filtrer les formes...',
    filterSearchLabPlaceholder: 'Filtrer les laboratoires...',
    sortByLabel: 'Trier par :',
    sortRelevance: 'Pertinence',
    sortBrandAsc: 'Nom commercial (A → Z)',
    sortBrandDesc: 'Nom commercial (Z → A)',
    sortDciAsc: 'Substance DCI (A → Z)',
    sortDciDesc: 'Substance DCI (Z → A)',
    sortDateDesc: 'Date d’enregistrement (Récents)',
    sortDateAsc: 'Date d’enregistrement (Anciens)',
    densityStandard: 'Standard',
    densityCompact: 'Compact',
    densityComfortable: 'Aéré',
    viewDetailsButton: 'Consulter la fiche',
    emptyResultsTitle: 'Aucun résultat correspondant',
    emptyResultsDesc: 'Aucune spécialité pharmaceutique ne correspond à vos critères de recherche actuels. Vérifiez l’orthographe ou réinitialisez les filtres.',
    emptyResultsAction: 'Réinitialiser tous les filtres',
    loadingMessage: 'Chargement du registre pharmaceutique...',
    errorMessage: 'Une erreur est survenue lors du chargement des données.',
    errorRetry: 'Réessayer',
    discrepancyNoticeBadge: 'Signalement croisé',
    pagePrevious: 'Précédent',
    pageNext: 'Suivant',
    pageIndicator: 'Page {current} sur {total}',

    backToResults: 'Retour aux résultats',
    copyLink: 'Copier le lien',
    linkCopied: 'Lien copié dans le presse-papier !',
    favouriteAdd: 'Ajouter aux favoris',
    favouriteRemove: 'Retirer des favoris',
    personalAliasLabel: 'Mon alias personnalisé (stocké localement) :',
    personalAliasPlaceholder: 'Ex: Traitement allergie matin, Pilule tension...',
    personalAliasSave: 'Enregistrer l’alias',
    personalAliasDelete: 'Supprimer',
    personalAliasActive: 'Alias personnel :',
    presentationSectionTitle: 'Informations de la présentation',
    otherPresentationsTitle: 'Autres présentations de cette DCI',
    otherPresentationsSubtitle: 'Autres formes, dosages et marques partageant la même substance active enregistrée',
    historySectionTitle: 'Historique & Traçabilité Officielle',
    discrepancyCardTitle: 'Signalement Administratif Croisé',
    discrepancyCardDesc: 'Ce produit figure également dans un autre registre officiel sous la même référence administrative.',
    discrepancyViewLink: 'Consulter la fiche correspondante',
    fieldBrand: 'Nom de marque',
    fieldDci: 'Dénomination commune internationale (DCI)',
    fieldForm: 'Forme pharmaceutique',
    fieldDosage: 'Dosage / Titrage',
    fieldPackaging: 'Conditionnement',
    fieldSchedule: 'Liste réglementaire',
    fieldType: 'Classification type',
    fieldLaboratory: 'Laboratoire détenteur de la décision',
    fieldCountry: 'Pays du laboratoire',
    fieldRegNumber: "N° d'enregistrement",
    fieldCode: 'Code produit',
    fieldShelfLife: 'Durée de stabilité',
    fieldOrigin: 'Origine de fabrication',
    fieldHospital: 'Usage hospitalier (HOP)',
    fieldOfficine: 'Délivrance en officine (OFF)',
    fieldObservations: 'Observations administratives',
    fieldInitialDate: "Date d'enregistrement initiale",
    fieldFinalDate: "Date d'enregistrement finale",
    fieldWithdrawalDate: 'Date de retrait',
    fieldWithdrawalReason: 'Motif officiel de retrait',
    fieldSourceWorksheet: 'Feuille du classeur officiel',
    fieldSourceRow: 'Ligne source originale',
    fieldSnapshotDate: 'Date de l’instantané officiel',
    invalidDateWarning: 'Date incomplète ou non reconnue dans le classeur source officiel. Valeur brute préservée sans extrapolation.',
    administrativeDateNotice: 'Mention administrative officielle consignée dans la colonne de date.',
    yes: 'Oui',
    no: 'Non',
    notFoundTitle: 'Produit introuvable',
    notFoundDesc: "L'identifiant demandé ne correspond à aucun enregistrement dans la nomenclature nationale.",
    notFoundAction: 'Retourner au registre',

    favouritesTitle: 'Mes Spécialités Favorites',
    favouritesSubtitle: 'Accès rapide à vos médicaments fréquemment consultés, stockés localement sur cet appareil.',
    favouritesCount: 'médicament(s) enregistré(s)',
    favouritesEmptyTitle: 'Aucun médicament dans vos favoris',
    favouritesEmptyDesc: 'Vous pouvez ajouter n’importe quelle spécialité à vos favoris en cliquant sur l’étoile depuis la recherche ou la fiche détaillée.',
    favouritesClearAll: 'Vider mes favoris',
    favouritesClearConfirm: 'Êtes-vous sûr de vouloir supprimer tous vos favoris et alias enregistrés ?',
    favouritesLocalDisclaimer: 'Vos favoris et alias sont stockés exclusivement dans ce navigateur. Ils ne sont pas synchronisés automatiquement entre vos différents appareils.',

    viewDensity: 'Densité',
    showingResults: 'Affichage de {from} à {to} sur {total} résultats',
    previousPage: 'Précédent',
    nextPage: 'Suivant',
    filtersTitle: 'Filtres de recherche',
    resetFilters: 'Réinitialiser les filtres',
    filterSourceList: 'Registre source',
    filterClassification: 'Classification',
    filterOrigin: 'Origine',
    filterDistribution: 'Délivrance',
    filterHospital: 'Usage hospitalier',
    filterOfficine: 'Officine',
    filterForm: 'Forme pharmaceutique',
    filterLaboratory: 'Laboratoire détenteur',
    showMore: 'de plus',
    showLess: 'Moins',
    applyFilters: 'Appliquer les filtres',
    removeFromFavourites: 'Retirer des favoris',
    addToFavourites: 'Ajouter aux favoris',
    discrepancyNotice: 'Signalement administratif croisé',
    discrepancyBadge: 'Signalement croisé',
    clearSearch: 'Effacer la recherche',
    resultsFound: '{count} résultat(s) trouvé(s) en {time} ms',
    sortLabel: 'Trier par',
    loadingData: 'Chargement du registre pharmaceutique...',
    errorLoadingData: 'Erreur de chargement des données',
    noResultsTitle: 'Aucun médicament trouvé',
    noResultsDesc: 'Aucune spécialité ne correspond à vos critères. Vérifiez l’orthographe ou réinitialisez les filtres.',
    backToSearch: 'Retour à la recherche',
    discrepancyBannerTitle: 'Signalement Administratif Croisé Détecté',
    discrepancyBannerDesc: 'Cette spécialité figure également dans un autre registre officiel sous la même référence administrative.',
    discrepancyCompareAction: 'Comparer avec cette fiche',
    favSaved: 'Enregistré',
    editAlias: 'Modifier',
    removeAlias: 'Supprimer',
    saveAlias: 'Enregistrer',
    aliasLabel: 'Alias personnalisé',
    aliasPlaceholder: 'Ex: Stock garde, Traitement habituel...',
    sectionIdentification: 'Identification & Spécifications',
    sectionLaboratories: 'Laboratoire & Fabricant',
    sectionStatusDates: 'Statut & Chronologie',
    sectionProvenance: 'Traçabilité & Source',
    fieldRegistrationNumber: "N° d'enregistrement",
    fieldInitialRegDate: "Date d'enregistrement initiale",
    fieldReRegistrationDate: 'Date de réenregistrement',
    fieldManufacturingOrigin: 'Origine de fabrication',
    relatedPresentationsTitle: 'Autres présentations de cette DCI',
    relatedPresentationsDesc: 'Autres formes, dosages ou marques partageant cette substance active',
    viewDetails: 'Consulter la fiche',

    codeStatutLabel: 'Origine de fabrication (STATUT)',
    codeTypeLabel: 'Classification produit (TYPE)',
    codeP1Label: 'Usage hospitalier (P1 - HOP)',
    codeP2Label: 'Délivrance en officine (P2 - OFF)',
    p1Specified: 'Spécifié dans le document source (HOP)',
    p1Unspecified: 'Non spécifié dans le document source',
    p2Specified: 'Spécifié dans le document source (OFF)',
    p2Unspecified: "Non spécifié dans le document source (l'absence de mention OFF ne prouve pas une exclusivité hospitalière)",
    typeGenericDesc: "Générique (GE) — enregistrement sous statut générique dans la nomenclature (n'atteste pas à lui seul d'une bioéquivalence certifiée pour chaque ligne)",
    typeReferenceDesc: 'Princeps / Référence (RE)',
    typeBioDesc: 'Produit biologique (BIO)',
    typeUnspecified: 'Non spécifié dans le document source',
    scheduleUnspecified: 'Non listé (non spécifié dans le registre officiel — ne préjuge pas du statut de vente libre)',
  },
  ar: {
    appName: 'فارماسيرش',
    appBadge: 'الجزائر',
    appSubtitle: 'المدونة الوطنية للمنتجات الصيدلانية',
    navHome: 'الرئيسية',
    navRegistry: 'السجل',
    navFavourites: 'المفضلة',
    navProvenance: 'المصدر والتنظيم',

    officialRepublic: 'الجمهورية الجزائرية الديمقراطية الشعبية',
    officialMinistry: 'وزارة الصناعة الصيدلانية',
    officialDirection: 'مديرية الاقتصاد الدوائي والأنشطة الصيدلانية والتنظيم',
    sourceSnapshotLabel: 'المصدر الرسمي',
    sourceSnapshotDate: '31 أوت 2026',
    verifiedSnapshotBadge: 'بيانات مؤكدة',
    provenanceNotice: 'مأخوذة مباشرة من المصنف الرسمي الصادر عن وزارة الصناعة الصيدلانية المؤرخ في 31 أوت 2026.',
    legalDisclaimer: 'يعكس هذا الموقع التصنيف الرسمي المسجل في القوائم المرجعية. إدراج أي دواء لا يضمن توفره الفعلي في الصيدليات، ويجب استشارة الطبيب أو الصيدلي دائماً.',
    localStorageNotice: 'يتم حفظ التفضيلات والأسماء المستعارة محلياً في متصفحك فقط، ولا يتم إرسالها إلى أي خادم خارجي أو مزامنتها تلقائياً بين أجهزتك.',
    footerCopyright: '© 2026 فارماسيرش الجزائر — خدمة عمومية للاستعلام الصيدلاني.',

    statusActive: 'نشط',
    statusNonRenewed: 'غير مجدد',
    statusWithdrawn: 'مسحوب',
    statusFabricationLocale: 'تصنيع محلي (F)',
    statusImportation: 'استيراد (I)',
    typeGeneric: 'جنيس (GE)',
    typeReference: 'أصيل / مرجعي (RE)',
    typeBiosimilar: 'بيولوجي (BIO)',

    heroEditionBadge: 'النظام المرجعي للأدوية — نسخة محينة لشهر أوت 2026',
    heroTitlePrefix: 'البحث في',
    heroTitleHighlight: 'المدونة الوطنية للأدوية',
    heroSubtitle: 'أداة بحث سريعة وموثوقة تغطي المنتجات الصيدلانية ذات الاستعمال البشري، الحالات التنظيمية، المواد الفعالة والمخابر بالجزائر.',
    searchPlaceholder: 'ابحث بالاسم التجاري، التسمية الدولية (DCI)، رقم التسجيل أو المخبر...',
    searchButton: 'بحث',
    searchExamplesLabel: 'أمثلة شائعة :',
    searchExamples: 'CETIRIZINE, PARACETAMOL, ARTIZ, SAIDAL, EL KENDI, 352/01 A 003/06/22',
    sourceListsTitle: 'القوائم الرسمية الثلاث المستخلصة من المصدر',
    sourceListsSubtitle: 'تم الحفاظ على كل قائمة بشكل مستقل تماماً وفق بيانات وزارة الصناعة الصيدلانية.',
    totalSourceRowsBadge: 'المجموع الإجمالي: 9 595 تسجيلاً صيدلانياً',
    list1Title: 'المدونة الوطنية 31 أوت 2026',
    list1Desc: 'الأدوية المعتمدة رسمياً والمسجلة في المدونة الوطنية الصادرة في 31 أوت 2026.',
    list1CountLabel: 'تسجيلات صيدلانية نشطة',
    list2Title: 'الأدوية غير المجددة',
    list2Desc: 'المنتجات الصيدلانية التي لم تخضع للتجديد الإداري عند تاريخ 31 أوت 2026.',
    list2CountLabel: 'تسجيلات غير مجددة',
    list3Title: 'الأدوية المسحوبة',
    list3Desc: 'الأدوية الصادر بشأنها قرار سحب تجاري أو تنظيمي، مع توثيق سبب وتاريخ السحب.',
    list3CountLabel: 'تسجيلات مسحوبة',
    densitySectionTitle: 'خيارات كثافة العرض',
    densitySectionSubtitle: 'مطابق لمواصفات التصميم المعتمدة: عادي، مدمج للمختصين، ومريح للقراءة.',

    searchPageTitle: 'سجل الأدوية — البحث',
    breadcrumbHome: 'الرئيسية',
    breadcrumbRegistry: 'السجل',
    breadcrumbSearch: 'البحث',
    breadcrumbDetail: 'تفاصيل الدواء',
    resultsCount: 'دواء صيدلاني مطابق',
    resultsCountZero: 'لم يتم العثور على أي دواء',
    allMedicinesHeadline: 'جميع الأدوية المسجلة في المدونة',
    filtersHeader: 'تصفية النتائج',
    filtersReset: 'إعادة ضبط',
    filterStatusLabel: 'الحالة التنظيمية',
    filterFormLabel: 'الشكل الصيدلاني',
    filterLaboratoryLabel: 'المخبر الحائز للرخصة',
    filterCountryLabel: 'بلد المخبر',
    filterClassificationLabel: 'النوع (تصنيف الدواء)',
    filterOriginLabel: 'مصدر التصنيع',
    filterChannelsLabel: 'قنوات الصرف والتوزيع',
    filterHospitalOnly: 'استعمال استشفائي (HOP)',
    filterOfficineOnly: 'صرف في الصيدليات (OFF)',
    filterSearchFormPlaceholder: 'بحث في الأشكال...',
    filterSearchLabPlaceholder: 'بحث في المخابر...',
    sortByLabel: 'ترتيب حسب :',
    sortRelevance: 'الأكثر صلة',
    sortBrandAsc: 'الاسم التجاري (أ → ي)',
    sortBrandDesc: 'الاسم التجاري (ي → أ)',
    sortDciAsc: 'المادة الفعالة DCI (أ → ي)',
    sortDciDesc: 'المادة الفعالة DCI (ي → أ)',
    sortDateDesc: 'تاريخ التسجيل (الأحدث)',
    sortDateAsc: 'تاريخ التسجيل (الأقدم)',
    densityStandard: 'عادي',
    densityCompact: 'مدمج',
    densityComfortable: 'مريح',
    viewDetailsButton: 'عرض التفاصيل',
    emptyResultsTitle: 'لا توجد نتائج مطابقة',
    emptyResultsDesc: 'لم يتطابق أي دواء مع معايير البحث الحالية. يرجى التحقق من الكلمات أو إعادة ضبط الفلاتر.',
    emptyResultsAction: 'إلغاء جميع الفلاتر',
    loadingMessage: 'جاري تحميل السجل الصيدلاني...',
    errorMessage: 'حدث خطأ أثناء تحميل البيانات الصيدلانية.',
    errorRetry: 'إعادة المحاولة',
    discrepancyNoticeBadge: 'تنبيه تعارض',
    pagePrevious: 'السابق',
    pageNext: 'التالي',
    pageIndicator: 'صفحة {current} من {total}',

    backToResults: 'العودة إلى النتائج',
    copyLink: 'نسخ الرابط',
    linkCopied: 'تم نسخ الرابط بنجاح !',
    favouriteAdd: 'إضافة إلى المفضلة',
    favouriteRemove: 'إزالة من المفضلة',
    personalAliasLabel: 'اسمي المستعار لهذا الدواء (محفوظ محلياً) :',
    personalAliasPlaceholder: 'مثال: علاج الحساسية، دواء الضغط الصباحي...',
    personalAliasSave: 'حفظ الاسم المستعار',
    personalAliasDelete: 'حذف',
    personalAliasActive: 'الاسم المستعار الشخصي :',
    presentationSectionTitle: 'بيانات ومواصفات الدواء',
    otherPresentationsTitle: 'مستحضرات أخرى لنفس المادة الفعالة (DCI)',
    otherPresentationsSubtitle: 'أشكال وجرعات وعلامات تجارية أخرى تشترك في نفس المادة الفعالة المسجلة',
    historySectionTitle: 'التاريخ والتتبع الرسمي',
    discrepancyCardTitle: 'تنبيه تصنيف إداري متبادل',
    discrepancyCardDesc: 'هذا الدواء مسجل أيضاً في قائمة رسمية أخرى بنفس المرجع الإداري.',
    discrepancyViewLink: 'معاينة البطاقة المقابلة',
    fieldBrand: 'الاسم التجاري (Marque)',
    fieldDci: 'التسمية الدولية المشتركة (DCI)',
    fieldForm: 'الشكل الصيدلاني',
    fieldDosage: 'الجرعة والتركيز',
    fieldPackaging: 'التعليب',
    fieldSchedule: 'الجدول التنظيمي (Liste)',
    fieldType: 'نوع الدواء',
    fieldLaboratory: 'المخبر الحائز على قرار التسجيل',
    fieldCountry: 'بلد المخبر',
    fieldRegNumber: 'رقم التسجيل',
    fieldCode: 'رمز المنتج',
    fieldShelfLife: 'مدة الصلاحية والاستقرار',
    fieldOrigin: 'طبيعة الإنتاج',
    fieldHospital: 'استعمال استشفائي (HOP)',
    fieldOfficine: 'صرف في الصيدلية (OFF)',
    fieldObservations: 'ملاحظات إدارية',
    fieldInitialDate: 'تاريخ التسجيل الأولي',
    fieldFinalDate: 'تاريخ التسجيل النهائي',
    fieldWithdrawalDate: 'تاريخ قرار السحب',
    fieldWithdrawalReason: 'السبب الرسمي للسحب',
    fieldSourceWorksheet: 'ورقة السجل الرسمية',
    fieldSourceRow: 'رقم السطر الأصلي في الملف',
    fieldSnapshotDate: 'تاريخ النسخة المعتمدة',
    invalidDateWarning: 'تاريخ غير مكتمل أو غير صالح في السجل الرسمي الأصلي. تم الاحتفاظ بالنص الخام كما هو.',
    administrativeDateNotice: 'عبارة إدارية رسمية مسجلة في خانة التاريخ.',
    yes: 'نعم',
    no: 'لا',
    notFoundTitle: 'الدواء غير موجود',
    notFoundDesc: 'الرقم التعريفي المطلوب لا يطابق أي دواء مسجل في المدونة الوطنية.',
    notFoundAction: 'العودة إلى السجل',

    favouritesTitle: 'أدويتي المفضلة',
    favouritesSubtitle: 'الوصول السريع للأدوية الأكثر استخداماً والمحفوظة محلياً على هذا الجهاز.',
    favouritesCount: 'أدوية محفوظة',
    favouritesEmptyTitle: 'قائمة المفضلة فارغة حالياً',
    favouritesEmptyDesc: 'يمكنك إضافة أي دواء إلى قائمتك المفضلة بالنقر على أيقونة النجمة من شاشة البحث أو صفحة التفاصيل.',
    favouritesClearAll: 'مسح المفضلة بالكامل',
    favouritesClearConfirm: 'هل أنت متأكد من رغبتك في حذف جميع الأدوية والأسماء المستعارة المحفوظة ؟',
    favouritesLocalDisclaimer: 'تُحفظ المفضلة والأسماء المستعارة محلياً في هذا المتصفح فقط، ولا يتم نقلها تلقائياً بين أجهزتك المختلفة.',

    viewDensity: 'الكثافة',
    showingResults: 'عرض من {from} إلى {to} من أصل {total} نتيجة',
    previousPage: 'السابق',
    nextPage: 'التالي',
    filtersTitle: 'تصفية النتائج',
    resetFilters: 'إعادة ضبط الفلاتر',
    filterSourceList: 'القائمة الرسمية',
    filterClassification: 'التصنيف',
    filterOrigin: 'المنشأ',
    filterDistribution: 'قنوات التوزيع',
    filterHospital: 'استعمال استشفائي',
    filterOfficine: 'صيدلية',
    filterForm: 'الشكل الصيدلاني',
    filterLaboratory: 'المخبر',
    showMore: 'المزيد',
    showLess: 'أقل',
    applyFilters: 'تطبيق عوامل التصفية',
    removeFromFavourites: 'إزالة من المفضلة',
    addToFavourites: 'إضافة للمفضلة',
    discrepancyNotice: 'تنبيه تصنيف إداري متبادل',
    discrepancyBadge: 'تنبيه تعارض',
    clearSearch: 'مسح البحث',
    resultsFound: 'تم العثور على {count} نتيجة في {time} ميلي ثانية',
    sortLabel: 'ترتيب حسب',
    loadingData: 'جارٍ تحميل السجل الصيدلاني...',
    errorLoadingData: 'خطأ في تحميل البيانات',
    noResultsTitle: 'لم يتم العثور على أي دواء',
    noResultsDesc: 'لا توجد أي نتائج مطابقة لبحثك. يرجى التأكد من صحة الكلمات أو إعادة ضبط الفلاتر.',
    backToSearch: 'العودة إلى البحث',
    discrepancyBannerTitle: 'تنبيه تصنيف إداري متبادل مكتشف',
    discrepancyBannerDesc: 'هذا الدواء مسجل أيضاً في قائمة رسمية أخرى بنفس المرجع الإداري.',
    discrepancyCompareAction: 'معاينة ومقارنة البطاقة المقابلة',
    favSaved: 'محفوظ',
    editAlias: 'تعديل',
    removeAlias: 'حذف',
    saveAlias: 'حفظ',
    aliasLabel: 'اسم مستعار',
    aliasPlaceholder: 'مثال: علاج الحساسية، دواء الضغط الصباحي...',
    sectionIdentification: 'التعريف والمواصفات',
    sectionLaboratories: 'المخبر والجهة المصنعة',
    sectionStatusDates: 'الحالة والتواريخ الرسمية',
    sectionProvenance: 'المصدر والمطابقة',
    fieldRegistrationNumber: 'رقم التسجيل',
    fieldInitialRegDate: 'تاريخ التسجيل الأولي',
    fieldReRegistrationDate: 'تاريخ إعادة التسجيل',
    fieldManufacturingOrigin: 'بلد التصنيع',
    relatedPresentationsTitle: 'مستحضرات أخرى لنفس المادة الفعالة (DCI)',
    relatedPresentationsDesc: 'أشكال أو جرعات أخرى تشترك في نفس المادة الفعالة',
    viewDetails: 'عرض التفاصيل',

    codeStatutLabel: 'منشأ التصنيع (STATUT)',
    codeTypeLabel: 'تصنيف المنتج (TYPE)',
    codeP1Label: 'الاستعمال الاستشفائي (P1 - HOP)',
    codeP2Label: 'الصرف في الصيدليات (P2 - OFF)',
    p1Specified: 'محدد في الوثيقة المصدرية (HOP)',
    p1Unspecified: 'غير محدد في الوثيقة المصدرية',
    p2Specified: 'محدد في الوثيقة المصدرية (OFF)',
    p2Unspecified: 'غير محدد في الوثيقة المصدرية (غياب بيان OFF لا يُعد إثباتاً للاقتصار على المستشفيات)',
    typeGenericDesc: 'جنيس (GE) — تسجيل كدواء جنيس في المدونة (لا يثبت بمفرده التكافؤ الحيوي المعتمد لكل سطر)',
    typeReferenceDesc: 'أصيل / مرجعي (RE)',
    typeBioDesc: 'منتج بيولوجي (BIO)',
    typeUnspecified: 'غير محدد في الوثيقة المصدرية',
    scheduleUnspecified: 'غير مدرج في قائمة (غير محدد في السجل الرسمي — لا يعني تلقائياً أنه يباع بدون وصفة / OTC)',
  },
};
