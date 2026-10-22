import fs from 'fs';
import path from 'path';

interface Provenance {
  sourceWorksheet: string;
  sourceRow: number;
  snapshotDate: string;
}

interface PharmaceuticalRecord {
  id: string;
  sourceList: string;
  registrationNumber: string;
  code: string;
  dci: string;
  brandName: string;
  form: string;
  dosage: string;
  packaging: string;
  prescriptionSchedule?: string;
  laboratory?: string;
  country?: string;
  shelfLife?: string;
  initialRegistrationDate?: { formatted: string | null; isInvalidDate?: boolean };
  finalRegistrationDate?: { formatted: string | null; isInvalidDate?: boolean };
  withdrawalDate?: { formatted: string | null; isInvalidDate?: boolean };
  withdrawalReason?: string;
  provenance: Provenance;
}

interface SeoRegistryEntry {
  urlKey: string;
  slug: string;
  canonicalPath: string;
  recordId: string;
  sourceList: string;
  brandName: string;
  dci: string;
  dosage: string;
  form: string;
  packaging: string;
  registrationNumber: string;
  code: string;
  fingerprint: string;
}

interface SeoRegistry {
  version: string;
  generatedAt: string;
  description: string;
  entries: SeoRegistryEntry[];
}

function escapeHtml(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function generateMedicineHtml(
  templateHtml: string,
  record: PharmaceuticalRecord,
  entry: SeoRegistryEntry
): string {
  const brand = record.brandName || 'Médicament';
  const dosage = record.dosage ? ` — ${record.dosage}` : '';
  const form = record.form ? ` (${record.form})` : '';
  const dci = record.dci || '';

  const title = `${brand}${dosage} | PharmaSearch`;
  const canonicalUrl = `https://pharmasearch.indz.net${entry.canonicalPath}`;

  const listLabel =
    record.sourceList === 'NOMENCLATURE_ACTIVE'
      ? 'Nomenclature active'
      : record.sourceList === 'NON_RENOUVELE'
      ? 'Non renouvelé'
      : record.sourceList === 'RETRAIT'
      ? 'Retiré'
      : record.sourceList;

  const description = `${brand} (${dci}) : ${record.dosage || ''} ${record.form || ''}, conditionnement ${record.packaging || ''}. Statut : ${listLabel}. Source officielle : Nomenclature Nationale au 31 Août 2026.`;

  // Server-rendered crawlable HTML payload to inject inside <div id="root">
  const noscriptSummaryHtml = `
    <article class="max-w-[1200px] mx-auto px-4 py-8 font-sans">
      <header class="border-b pb-4 mb-6">
        <div class="inline-block px-3 py-1 text-xs font-semibold rounded mb-3 ${
          record.sourceList === 'NOMENCLATURE_ACTIVE'
            ? 'bg-emerald-100 text-emerald-800'
            : record.sourceList === 'NON_RENOUVELE'
            ? 'bg-amber-100 text-amber-800'
            : 'bg-rose-100 text-rose-800'
        }">
          Classification officielle : ${escapeHtml(listLabel)}
        </div>
        <h1 class="text-2xl sm:text-3xl font-bold text-slate-900">${escapeHtml(brand)}${escapeHtml(dosage)}</h1>
        <p class="text-base text-slate-700 mt-1">${escapeHtml(dci)}${escapeHtml(form)}</p>
      </header>

      <section class="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6">
        <h2 class="text-lg font-semibold text-slate-800 mb-4">Caractéristiques pharmaceutiques et réglementaires</h2>
        <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div><dt class="font-medium text-slate-500">Numéro d'enregistrement</dt><dd class="text-slate-900 font-mono">${escapeHtml(record.registrationNumber)}</dd></div>
          <div><dt class="font-medium text-slate-500">Code produit</dt><dd class="text-slate-900 font-mono">${escapeHtml(record.code)}</dd></div>
          <div><dt class="font-medium text-slate-500">Dosage</dt><dd class="text-slate-900">${escapeHtml(record.dosage)}</dd></div>
          <div><dt class="font-medium text-slate-500">Forme</dt><dd class="text-slate-900">${escapeHtml(record.form)}</dd></div>
          <div><dt class="font-medium text-slate-500">Conditionnement</dt><dd class="text-slate-900">${escapeHtml(record.packaging)}</dd></div>
          <div><dt class="font-medium text-slate-500">Laboratoire</dt><dd class="text-slate-900">${escapeHtml(record.laboratory || 'Non spécifié')}</dd></div>
          <div><dt class="font-medium text-slate-500">Pays</dt><dd class="text-slate-900">${escapeHtml(record.country || 'Non spécifié')}</dd></div>
          <div><dt class="font-medium text-slate-500">Durée de conservation</dt><dd class="text-slate-900">${escapeHtml(record.shelfLife || 'Non spécifiée')}</dd></div>
          ${
            record.withdrawalDate
              ? `<div><dt class="font-medium text-rose-600">Date de retrait</dt><dd class="text-rose-900 font-semibold">${escapeHtml(record.withdrawalDate.formatted || 'Non spécifiée')}</dd></div>`
              : ''
          }
          ${
            record.withdrawalReason
              ? `<div class="sm:col-span-2"><dt class="font-medium text-rose-600">Motif de retrait officiel</dt><dd class="text-rose-900">${escapeHtml(record.withdrawalReason)}</dd></div>`
              : ''
          }
        </dl>
      </section>

      <footer class="text-xs text-slate-500 border-t pt-4 space-y-1">
        <p>Source : Nomenclature Nationale des Produits Pharmaceutiques — Arrêté et situation administrative au <strong>31 Août 2026</strong> (${escapeHtml(record.provenance.sourceWorksheet)}, référence ligne ${escapeHtml(String(record.provenance.sourceRow))}).</p>
        <p>Avertissement : Cette fiche présente la transcription technique du registre officiel snapshot au 31/08/2026 et ne constitue pas une confirmation de disponibilité commerciale en temps réel ou un conseil médical.</p>
      </footer>
    </article>
  `;

  let html = templateHtml;

  // Replace Title
  html = html.replace(
    /<title>.*?<\/title>/i,
    `<title>${escapeHtml(title)}</title>`
  );

  // Replace Canonical Link
  html = html.replace(
    /<link rel="canonical" href=".*?" \/>/i,
    `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`
  );

  // Replace Meta Description
  html = html.replace(
    /<meta name="description" content=".*?" \/>/i,
    `<meta name="description" content="${escapeHtml(description)}" />`
  );

  // Replace Open Graph Meta
  html = html.replace(
    /<meta property="og:title" content=".*?" \/>/i,
    `<meta property="og:title" content="${escapeHtml(title)}" />`
  );
  html = html.replace(
    /<meta property="og:description" content=".*?" \/>/i,
    `<meta property="og:description" content="${escapeHtml(description)}" />`
  );
  html = html.replace(
    /<meta property="og:url" content=".*?" \/>/i,
    `<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`
  );

  // Replace Twitter Meta
  html = html.replace(
    /<meta name="twitter:title" content=".*?" \/>/i,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`
  );
  html = html.replace(
    /<meta name="twitter:description" content=".*?" \/>/i,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`
  );

  // Inject crawlable content into <div id="root">
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root">${noscriptSummaryHtml}</div>`
  );

  return html;
}

export function generate404Html(templateHtml: string): string {
  let html = templateHtml;

  const title = 'Produit ou page introuvable | PharmaSearch';
  const description =
    "La référence pharmaceutique demandée n'existe pas ou n'est plus répertoriée dans la Nomenclature Nationale au 31 Août 2026.";

  html = html.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  html = html.replace(
    /<meta name="description" content=".*?" \/>/i,
    `<meta name="description" content="${escapeHtml(description)}" />`
  );
  html = html.replace(
    /<meta name="robots" content=".*?" \/>/i,
    '<meta name="robots" content="noindex, nofollow" />'
  );
  if (!html.includes('<meta name="robots"')) {
    html = html.replace(
      '<meta name="description"',
      '<meta name="robots" content="noindex, nofollow" />\n    <meta name="description"'
    );
  }

  const notFoundBody = `
    <main class="max-w-[700px] mx-auto px-4 py-16 text-center font-sans">
      <div class="p-8 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
        <h1 class="text-2xl font-bold text-slate-900">404 — Produit ou référence introuvable</h1>
        <p class="text-sm text-slate-600 max-w-md mx-auto">
          La fiche pharmaceutique demandée ne figure pas dans le registre officiel de la Nomenclature au 31 Août 2026.
        </p>
        <div class="pt-4">
          <a href="/" class="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors">
            Retour au registre national
          </a>
        </div>
      </div>
    </main>
  `;

  html = html.replace('<div id="root"></div>', `<div id="root">${notFoundBody}</div>`);
  return html;
}

export function runPrerenderSamples(distDir = path.resolve('dist')) {
  const indexHtmlPath = path.join(distDir, 'index.html');
  if (!fs.existsSync(indexHtmlPath)) {
    throw new Error(`dist/index.html not found at ${indexHtmlPath}. Run build first.`);
  }

  const templateHtml = fs.readFileSync(indexHtmlPath, 'utf8');

  // Load nomenclature data
  const dataJsonPath = path.resolve('public/data/nomenclature.json');
  const data = JSON.parse(fs.readFileSync(dataJsonPath, 'utf8'));
  const recordsMap = new Map<string, PharmaceuticalRecord>();
  data.records.forEach((r: PharmaceuticalRecord) => {
    recordsMap.set(r.id, r);
  });

  // Load SEO Registry
  const registryPath = path.resolve('src/data/seo-url-registry.json');
  const registry: SeoRegistry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

  console.log(`Prerendering ${registry.entries.length} valid sample medicine pages...`);

  let totalBytes = 0;
  const generatedFiles: string[] = [];

  for (const entry of registry.entries) {
    const record = recordsMap.get(entry.recordId);
    if (!record) {
      throw new Error(`Record ${entry.recordId} referenced in SEO registry not found in dataset!`);
    }

    const pageHtml = generateMedicineHtml(templateHtml, record, entry);

    // Target path: dist/medicament/<slug-urlKey>/index.html
    // e.g. canonicalPath is /medicament/abilify-maintena-400-mg-5f9a078862/
    const relativeFolder = entry.canonicalPath.replace(/^\//, '').replace(/\/$/, '');
    const outFolder = path.join(distDir, relativeFolder);
    fs.mkdirSync(outFolder, { recursive: true });

    const outFilePath = path.join(outFolder, 'index.html');
    fs.writeFileSync(outFilePath, pageHtml, 'utf8');

    const bytes = Buffer.byteLength(pageHtml, 'utf8');
    totalBytes += bytes;
    generatedFiles.push(outFilePath);
    console.log(`✓ Generated ${entry.canonicalPath} (${bytes} bytes) for ${record.id} [${record.brandName}]`);
  }

  // Generate 404.html in dist
  const notFoundHtml = generate404Html(templateHtml);
  const notFoundPath = path.join(distDir, '404.html');
  fs.writeFileSync(notFoundPath, notFoundHtml, 'utf8');
  console.log(`✓ Generated 404.html (${Buffer.byteLength(notFoundHtml, 'utf8')} bytes)`);

  console.log(`Prerender complete. Generated ${generatedFiles.length} pages + 404. Total HTML payload: ${(totalBytes / 1024).toFixed(2)} KB.`);
}

// If executed directly via node/ts-node
if (process.argv[1] && process.argv[1].includes('prerender-seo-samples')) {
  runPrerenderSamples();
}
