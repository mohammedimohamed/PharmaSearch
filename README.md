# PharmaSearch (DZ) — Registre Pharmaceutique National

Application web réactive et performante pour la consultation publique de la Nomenclature Nationale des Produits Pharmaceutiques à usage de la médecine humaine en Algérie, arrêtée au **31 Août 2026**.

Conçue selon les spécifications institutionnelles et cliniques du système de design Stitch (`DESIGN.md`).

---

## 1. Architecture Globale

PharmaSearch est conçu selon une architecture **100% statique côté client (SPA)** ultra-légère et résiliente :

* **Frontend UI :** React 19 + TypeScript + Vite 6 + Tailwind CSS.
* **Système de Design :** Basé sur Material Design 3, palette Sarcelle/Ardoise (`#005c55`), typographie Inter et Noto Sans Arabic, conformité WCAG 2.1 AA.
* **Bilinguisme & RTL :** Prise en charge native du Français (LTR) et de l'Arabe (RTL avec basculement dynamique `dir="rtl"`).
* **Moteur de Recherche :** Recherche plein texte et facettes multi-critères exécutées directement dans le navigateur (zéro latence réseau, fonctionnement hors-ligne possible).
* **Stockage Local :** Les favoris, alias personnalisés et historique récent sont persistés exclusivement dans le stockage local du navigateur (`localStorage`), sans serveur distant ni traçage.
* **Déploiement cible :** Déploiement statique Vercel (avec compatibilité Render Static Sites et GitHub Pages).

---

## 2. Intégrité des Données & Règles Métier

1. **Trois listes sources officielles distinctes :**
   * **Nomenclature Nationale (31 Août 2026) :** 5 425 lignes enregistrées.
   * **Produits Non Renouvelés :** 1 491 lignes.
   * **Produits Faisant l'Objet de Retrait :** 2 679 lignes.
   * *Total cumulé :* 9 595 lignes sources (ne préjuge pas du nombre de molécules uniques).
2. **Identité des enregistrements :** Le numéro d'enregistrement seul n'est pas une clé primaire unique (certains produits partagent un même numéro pour des conditionnements différents). L'identité est assurée par identifiant déterministe avec traçabilité complète de la feuille et de la ligne source.
3. **Statut réglementaire vs Origine de fabrication :**
   * Le statut réglementaire (*Actif*, *Non renouvelé*, *Retiré*) est dérivé de la feuille d'appartenance.
   * La colonne source `STATUT` représente l'origine de fabrication : `F` = Fabrication locale, `I` = Importation.
4. **Pas d'inférence abusive :** Une valeur vide pour le champ `LISTE` n'est pas assimilée arbitrairement à de l'automédication (OTC). Les dates incomplètes (`00/00/2019`) et mentions administratives (`RETRAIT`, `ABROGATION`) sont conservées fidèlement.

---

## 3. Installation et Démarrage Local

### Prérequis
* Node.js version 20+ ou 24+
* npm version 10+

### Commandes

```bash
# 1. Cloner le dépôt et entrer dans le répertoire
cd PHARMASEARCH

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur de développement local
npm run dev

# 4. Exécuter la suite de tests automatisés
npm run test

# 5. Vérifier les types TypeScript et compiler pour la production
npm run build

# 6. Prévisualiser le build de production localement
npm run preview

# 7. Linter le code
npm run lint
```

---

## 4. Pipeline de Données Source vers JSON (`scripts/`)

Le classeur source `clean_NOMENCLATURE.VERSION.AOUT_.2026- (1).xlsx` sert d'entrée locale pour la génération d'un artefact JSON statique optimisé :

```bash
# Générer le jeu de données JSON à partir du classeur Excel officiel
npm run data:process

# Valider la conformité stricte et l'intégrité du jeu de données généré
npm run data:validate
```

L'application déployée consomme exclusivement le fichier JSON généré et compressé (`public/data/nomenclature.json`), garantissant un chargement instantané sans bibliothèque de lecture Excel dans le navigateur client.

---

## 5. Déploiement Statique

### Vercel (Cible Recommandée)
L'application se déploie comme un site statique standard :
* **Build Command :** `npm run build`
* **Output Directory :** `dist`
* **SPA Routing :** Réécriture des routes profondes vers `/index.html`.

Aucune base de données, variable secrète ou service tiers payant n'est requis.
