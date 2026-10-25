import { describe, it, expect, beforeAll, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  generateCatalogueRegistry,
  type SeoRegistry,
  type SourceRecord,
} from '../../scripts/generate-seo-registry';
import { runPrerenderCatalogue } from '../../scripts/prerender-seo-samples';
import { RECORD_ID_TO_CANONICAL_PATH, KEY_TO_RECORD_ID, resolveToRecordId } from '@/utils/seoRegistry';

const root = path.resolve(__dirname, '../../');

// Full-catalogue checks iterate 9,595 files; give them headroom when run in parallel with other suites
vi.setConfig({ testTimeout: 120000 });
const distDir = path.join(root, 'dist');
const SITE = 'https://pharmasearch.indz.net';

const dataset = JSON.parse(fs.readFileSync(path.join(root, 'public/data/nomenclature.json'), 'utf8'));
const records: Array<SourceRecord & { brandName: string; dosage: string }> = dataset.records;
const registry: SeoRegistry = JSON.parse(fs.readFileSync(path.join(root, 'seo/seo-url-registry.json'), 'utf8'));

const decode = (s: string) =>
  s.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const attr = (html: string, re: RegExp) => {
  const m = html.match(re);
  return m ? decode(m[1]) : null;
};

describe('SEO catalogue-wide: registry integrity (all source records)', () => {
  it('source dataset has the expected 9,595 records with correct list counts', () => {
    expect(records.length).toBe(9595);
    expect(dataset.metadata.totalSourceRows).toBe(9595);
    const count = (l: string) => records.filter((r) => r.sourceList === l).length;
    expect(count('NOMENCLATURE_ACTIVE')).toBe(5425);
    expect(count('NON_RENOUVELE')).toBe(1491);
    expect(count('RETRAIT')).toBe(2679);
    expect(new Set(records.map((r) => r.id)).size).toBe(9595);
  });

  it('every record has exactly one registry entry and one unique canonical path/key', () => {
    expect(registry.entries.length).toBe(records.length);
    expect(new Set(registry.entries.map((e) => e.recordId)).size).toBe(9595);
    expect(new Set(registry.entries.map((e) => e.canonicalPath)).size).toBe(9595);
    expect(new Set(registry.entries.map((e) => e.urlKey)).size).toBe(9595);
    for (const r of records) {
      expect(registry.entries.some((e) => e.recordId === r.id)).toBe(true);
    }
    for (const e of registry.entries) {
      expect(e.canonicalPath).toBe(`/medicament/${e.slug}-${e.urlKey}/`);
      expect(e.urlKey).toMatch(/^[a-f0-9]{10}$/);
    }
  });

  it('client URL map matches the committed registry for all records', () => {
    expect(RECORD_ID_TO_CANONICAL_PATH.size).toBe(9595);
    expect(KEY_TO_RECORD_ID.size).toBe(9595);
    for (const e of registry.entries) {
      expect(RECORD_ID_TO_CANONICAL_PATH.get(e.recordId)).toBe(e.canonicalPath);
      expect(resolveToRecordId(e.canonicalPath)).toBe(e.recordId);
    }
  });

  it('the 3 prototype URLs are unchanged', () => {
    const get = (id: string) => registry.entries.find((e) => e.recordId === id)?.canonicalPath;
    expect(get('NOM-4460')).toBe('/medicament/abilify-maintena-400-mg-5f9a078862/');
    expect(get('NON-13')).toBe('/medicament/polaramine-5mg-ml-25271e978e/');
    expect(get('RET-12')).toBe('/medicament/astemizol-ratiopharm-10mg-f82f512d54/');
  });

  it('known duplicate pairs keep both records with distinct deterministic URLs', () => {
    for (const [a, b] of [
      ['NOM-2794', 'NOM-2795'],
      ['RET-1152', 'RET-1155'],
    ]) {
      const ea = registry.entries.find((e) => e.recordId === a)!;
      const eb = registry.entries.find((e) => e.recordId === b)!;
      expect(ea).toBeDefined();
      expect(eb).toBeDefined();
      expect(ea.canonicalPath).not.toBe(eb.canonicalPath);
    }
  });

  it('registry generation is deterministic and persistent (existing keys are never changed)', () => {
    const again = generateCatalogueRegistry(records, registry);
    expect(again.entries.map((e) => e.canonicalPath)).toEqual(registry.entries.map((e) => e.canonicalPath));
    const fresh = generateCatalogueRegistry(records);
    expect(fresh.entries.map((e) => e.canonicalPath)).toEqual(registry.entries.map((e) => e.canonicalPath));
  });

  it('generation fails clearly on collisions, missing records and altered prototype URLs', () => {
    const tampered: SeoRegistry = JSON.parse(JSON.stringify(registry));
    tampered.entries[0].urlKey = '0000000000';
    tampered.entries[0].canonicalPath = '/medicament/x-0000000000/';
    // duplicate source id must throw
    expect(() => generateCatalogueRegistry([records[0], records[0]])).toThrow(/duplicate source record id/);
    // prototype URL tampering must throw
    const protoIdx = tampered.entries.findIndex((e) => e.recordId === 'NOM-4460');
    tampered.entries[protoIdx].urlKey = 'ffffffffff';
    expect(() => generateCatalogueRegistry(records, tampered)).toThrow(/prototype URL/);
  });
});

describe('SEO catalogue-wide: generated static output (dist)', () => {
  beforeAll(() => {
    if (!fs.existsSync(path.join(distDir, 'sitemap.xml'))) {
      throw new Error('dist/ not built: run `npm run build` before the catalogue output tests');
    }
  });

  it('every record has a generated page with correct record-specific metadata and content', () => {
    let checked = 0;
    const byId = new Map(records.map((r) => [r.id, r]));
    for (const e of registry.entries) {
      const file = path.join(distDir, e.canonicalPath.replace(/^\//, ''), 'index.html');
      expect(fs.existsSync(file), `missing ${file}`).toBe(true);
      const html = fs.readFileSync(file, 'utf8');
      const r = byId.get(e.recordId) as unknown as {
        brandName: string; dosage: string; registrationNumber: string; sourceList: string;
      };
      const title = attr(html, /<title>(.*?)<\/title>/)!;
      const canonical = `${SITE}${e.canonicalPath}`;

      expect(title).toContain(r.brandName.replace(/\s+/g, ' ').trim());
      expect(title.endsWith('| PharmaSearch')).toBe(true);
      expect(title).not.toBe('PharmaSearch');
      expect(attr(html, /<link rel="canonical" href="(.*?)" \/>/)).toBe(canonical);
      expect(attr(html, /<meta property="og:url" content="(.*?)" \/>/)).toBe(canonical);
      expect(attr(html, /<meta property="og:title" content="(.*?)" \/>/)).toBe(title);
      expect(attr(html, /<meta name="twitter:title" content="(.*?)" \/>/)).toBe(title);
      const desc = attr(html, /<meta name="description" content="(.*?)" \/>/)!;
      expect(desc).toContain(r.brandName.replace(/\s+/g, ' ').trim()); // description whitespace is normalized
      expect(attr(html, /<meta property="og:description" content="(.*?)" \/>/)).toBe(desc);
      expect(attr(html, /<meta name="twitter:description" content="(.*?)" \/>/)).toBe(desc);
      expect(html).toContain('property="og:image"');
      expect(html).toContain('name="twitter:card"');
      expect(html).toContain('property="og:type"');
      expect(html).toContain(decode('31 Août 2026'));
      expect(html).toContain('<h1');
      expect(html).toContain(escapeForCheck(r.registrationNumber));
      checked++;
    }
    expect(checked).toBe(9595);
  });

  it('no page carries the generic SPA-shell title/canonical', () => {
    const shell = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
    const shellTitle = attr(shell, /<title>(.*?)<\/title>/);
    for (const e of registry.entries) {
      const html = fs.readFileSync(path.join(distDir, e.canonicalPath.replace(/^\//, ''), 'index.html'), 'utf8');
      expect(attr(html, /<title>(.*?)<\/title>/)).not.toBe(shellTitle);
      expect(html).not.toContain(`<link rel="canonical" href="${SITE}/" />`);
    }
  });

  it('generates exactly 9,595 catalogue pages plus index.html, 404.html and sitemap.xml', () => {
    const dir = path.join(distDir, 'medicament');
    const folders = fs.readdirSync(dir);
    expect(folders.length).toBe(9595);
    expect(fs.existsSync(path.join(distDir, 'index.html'))).toBe(true);
    expect(fs.existsSync(path.join(distDir, '404.html'))).toBe(true);
  });

  it('sitemap lists each canonical URL exactly once with production origin and valid pages', () => {
    const xml = fs.readFileSync(path.join(distDir, 'sitemap.xml'), 'utf8');
    const locs = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
    const medicineLocs = locs.filter((l) => l.includes('/medicament/'));
    expect(medicineLocs.length).toBe(9595);
    expect(new Set(locs).size).toBe(locs.length);
    expect(locs).toContain(`${SITE}/`);
    expect(xml).not.toContain('vercel.app');
    expect(xml).not.toContain('<lastmod>');
    const expected = new Set(registry.entries.map((e) => `${SITE}${e.canonicalPath}`));
    for (const l of medicineLocs) {
      expect(expected.has(l)).toBe(true);
      expect(fs.existsSync(path.join(distDir, l.replace(SITE, '').replace(/^\//, ''), 'index.html'))).toBe(true);
    }
  });

  it('404.html is noindex and unknown record URLs have no generated page', () => {
    const nf = fs.readFileSync(path.join(distDir, '404.html'), 'utf8');
    expect(nf).toContain('noindex');
    expect(fs.existsSync(path.join(distDir, 'medicament/does-not-exist-0000000000/index.html'))).toBe(false);
  });

  it('prerender fails clearly on unexpected record counts', () => {
    expect(() => runPrerenderCatalogue(distDir, 1234)).toThrow(/Unexpected source record count/);
  });
});

function escapeForCheck(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
