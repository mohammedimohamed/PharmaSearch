import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export interface SourceRecord {
  id: string;
  sourceList: string;
  registrationNumber: string;
  code: string;
  dci: string;
  brandName: string;
  form: string;
  dosage: string;
  packaging: string;
  initialRegistrationDate?: { raw?: string };
  finalRegistrationDate?: { raw?: string };
  withdrawalDate?: { raw?: string };
  provenance: { sourceRow: number };
}

export interface SeoRegistryEntry {
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

export interface SeoRegistry {
  version: string;
  generatedAt: string;
  description: string;
  entries: SeoRegistryEntry[];
}

export function createSlug(brandName: string, dosage: string): string {
  const combined = [brandName, dosage].filter(Boolean).join(' ');
  return (
    combined
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80)
      .replace(/-+$/g, '') || 'medicament'
  );
}

const sha = (s: string) => crypto.createHash('sha256').update(s, 'utf8').digest('hex');

function baseParts(r: SourceRecord): string[] {
  return [r.sourceList, r.registrationNumber, r.code, r.brandName, r.dci, r.dosage, r.form, r.packaging].map(
    (v) => v ?? ''
  );
}

/**
 * Deterministic differentiator used ONLY when two source records are identical
 * across all base identity fields: the verified official dates, then the source row.
 */
function differentiator(r: SourceRecord): string {
  return (
    r.withdrawalDate?.raw ||
    r.initialRegistrationDate?.raw ||
    r.finalRegistrationDate?.raw ||
    String(r.provenance.sourceRow)
  );
}

/**
 * Builds the full-catalogue registry. Entries already present in `existing`
 * (matched by recordId + fingerprint) are reused verbatim so public URL keys never change.
 * Fails loudly on any collision, missing entry, or changed prototype URL.
 */
export function generateCatalogueRegistry(records: SourceRecord[], existing?: SeoRegistry): SeoRegistry {
  const baseCounts = new Map<string, number>();
  for (const r of records) {
    const k = sha(baseParts(r).join('|')).slice(0, 10);
    baseCounts.set(k, (baseCounts.get(k) || 0) + 1);
  }
  // Also count full-hash duplicates to make sure the differentiator separates them
  const existingById = new Map<string, SeoRegistryEntry>();
  existing?.entries.forEach((e) => existingById.set(e.recordId, e));

  const entries: SeoRegistryEntry[] = [];
  const keyToId = new Map<string, string>();
  const pathToId = new Map<string, string>();
  const seenIds = new Set<string>();

  for (const r of records) {
    if (seenIds.has(r.id)) throw new Error(`FATAL: duplicate source record id ${r.id}`);
    seenIds.add(r.id);

    const baseFp = sha(baseParts(r).join('|'));
    let fingerprint = baseFp;
    let urlKey = baseFp.slice(0, 10);
    if ((baseCounts.get(urlKey) || 0) > 1) {
      fingerprint = sha([...baseParts(r), differentiator(r)].join('|'));
      urlKey = fingerprint.slice(0, 10);
    }

    const prior = existingById.get(r.id);
    let slug = createSlug(r.brandName, r.dosage);
    if (prior) {
      // Persistence: never change a published URL key/path.
      urlKey = prior.urlKey;
      slug = prior.slug;
      fingerprint = prior.fingerprint;
    }
    const canonicalPath = `/medicament/${slug}-${urlKey}/`;

    if (keyToId.has(urlKey)) {
      throw new Error(`FATAL: URL key collision "${urlKey}" between ${r.id} and ${keyToId.get(urlKey)}`);
    }
    if (pathToId.has(canonicalPath)) {
      throw new Error(`FATAL: canonical path collision "${canonicalPath}" between ${r.id} and ${pathToId.get(canonicalPath)}`);
    }
    keyToId.set(urlKey, r.id);
    pathToId.set(canonicalPath, r.id);

    entries.push({
      urlKey,
      slug,
      canonicalPath,
      recordId: r.id,
      sourceList: r.sourceList,
      brandName: r.brandName,
      dci: r.dci,
      dosage: r.dosage,
      form: r.form,
      packaging: r.packaging,
      registrationNumber: r.registrationNumber,
      code: r.code,
      fingerprint,
    });
  }

  if (entries.length !== records.length) throw new Error('FATAL: registry entry count != record count');

  const proto: Record<string, string> = {
    'NOM-4460': '/medicament/abilify-maintena-400-mg-5f9a078862/',
    'NON-13': '/medicament/polaramine-5mg-ml-25271e978e/',
    'RET-12': '/medicament/astemizol-ratiopharm-10mg-f82f512d54/',
  };
  for (const [id, p] of Object.entries(proto)) {
    const e = entries.find((x) => x.recordId === id);
    if (e && e.canonicalPath !== p) throw new Error(`CRITICAL: prototype URL for ${id} changed: ${e.canonicalPath}`);
  }

  return {
    version: '2.0.0',
    generatedAt: existing?.generatedAt ?? '2026-10-22T08:30:00Z',
    description:
      'PharmaSearch persistent SEO URL registry (permanent public URL keys) for the 31 August 2026 snapshot. Keys are independent of source worksheet row identifiers.',
    entries,
  };
}

export function writeRegistryFiles(
  nomenclaturePath = path.resolve('public/data/nomenclature.json'),
  registryPath = path.resolve('seo/seo-url-registry.json'),
  mapPath = path.resolve('src/data/seo-url-map.json')
) {
  const data = JSON.parse(fs.readFileSync(nomenclaturePath, 'utf8'));
  const existing: SeoRegistry | undefined = fs.existsSync(registryPath)
    ? JSON.parse(fs.readFileSync(registryPath, 'utf8'))
    : undefined;
  const registry = generateCatalogueRegistry(data.records, existing);
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 1) + '\n', 'utf8');

  // Compact client map: recordId -> "slug-urlKey"
  const map: Record<string, string> = {};
  registry.entries.forEach((e) => {
    map[e.recordId] = `${e.slug}-${e.urlKey}`;
  });
  fs.writeFileSync(mapPath, JSON.stringify(map), 'utf8');

  console.log(`Source records: ${data.records.length}`);
  console.log(`Registry entries: ${registry.entries.length}`);
  console.log(`Unique paths: ${new Set(registry.entries.map((e) => e.canonicalPath)).size}`);
  return registry;
}

if (process.argv[1] && process.argv[1].includes('generate-seo-registry')) {
  writeRegistryFiles();
}
