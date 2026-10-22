import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  SEO_REGISTRY,
  extractUrlKeyFromPath,
  resolveToRecordId,
  getCanonicalPathForRecord,
} from '@/utils/seoRegistry';

describe('SEO Phase B: Clean Medicine URLs and Static HTML Prototype', () => {
  const rootDir = path.resolve(__dirname, '../../');
  const nomenclaturePath = path.join(rootDir, 'public/data/nomenclature.json');
  const distDir = path.join(rootDir, 'dist');

  describe('1. SEO URL Registry Integrity', () => {
    it('contains exactly the 3 valid prototype entries with valid structure', () => {
      expect(SEO_REGISTRY.entries.length).toBe(3);
      const keys = SEO_REGISTRY.entries.map((e) => e.urlKey);
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(3);

      const recordIds = SEO_REGISTRY.entries.map((e) => e.recordId);
      expect(recordIds).toContain('NOM-4460');
      expect(recordIds).toContain('NON-13');
      expect(recordIds).toContain('RET-12');
    });

    it('each registry entry maps to an existing source record in public/data/nomenclature.json', () => {
      const data = JSON.parse(fs.readFileSync(nomenclaturePath, 'utf8'));
      const recordMap = new Map<string, { brandName: string; sourceList: string; registrationNumber: string; code: string }>();
      data.records.forEach((r: { id: string; brandName: string; sourceList: string; registrationNumber: string; code: string }) => recordMap.set(r.id, r));

      expect(data.records.length).toBe(9595);

      for (const entry of SEO_REGISTRY.entries) {
        const record = recordMap.get(entry.recordId);
        expect(record).toBeDefined();
        if (!record) continue;
        expect(record.brandName).toBe(entry.brandName);
        expect(record.sourceList).toBe(entry.sourceList);
        expect(record.registrationNumber).toBe(entry.registrationNumber);
        expect(record.code).toBe(entry.code);

        // Public URL key is independent of row order (10 hex characters derived from normalized fingerprint)
        expect(entry.urlKey).toMatch(/^[a-f0-9]{10}$/);
        expect(entry.fingerprint).toMatch(/^[a-f0-9]{64}$/);
        expect(entry.fingerprint.startsWith(entry.urlKey)).toBe(true);
      }
    });

    it('resolves extractUrlKeyFromPath and resolveToRecordId accurately', () => {
      expect(
        extractUrlKeyFromPath('/medicament/abilify-maintena-400-mg-5f9a078862/')
      ).toBe('5f9a078862');
      expect(
        extractUrlKeyFromPath('/medicament/abilify-maintena-400-mg-5f9a078862')
      ).toBe('5f9a078862');
      expect(extractUrlKeyFromPath('/medicament/5f9a078862')).toBe('5f9a078862');
      expect(extractUrlKeyFromPath('/medicament/')).toBeNull();

      expect(
        resolveToRecordId('abilify-maintena-400-mg-5f9a078862')
      ).toBe('NOM-4460');
      expect(
        resolveToRecordId('/medicament/polaramine-5mg-ml-25271e978e/')
      ).toBe('NON-13');
      expect(
        resolveToRecordId('/medicament/astemizol-ratiopharm-10mg-f82f512d54/')
      ).toBe('RET-12');

      // Legacy fallback
      expect(resolveToRecordId('NOM-4460')).toBe('NOM-4460');
      expect(resolveToRecordId('NOM-3277')).toBe('NOM-3277');
      expect(resolveToRecordId('DOES-NOT-EXIST')).toBe('DOES-NOT-EXIST');
    });

    it('getCanonicalPathForRecord returns clean canonical path for registered records, and legacy path otherwise', () => {
      expect(getCanonicalPathForRecord('NOM-4460')).toBe(
        '/medicament/abilify-maintena-400-mg-5f9a078862/'
      );
      expect(getCanonicalPathForRecord('NON-13')).toBe(
        '/medicament/polaramine-5mg-ml-25271e978e/'
      );
      expect(getCanonicalPathForRecord('RET-12')).toBe(
        '/medicament/astemizol-ratiopharm-10mg-f82f512d54/'
      );
      expect(getCanonicalPathForRecord('NOM-17')).toBe('/medicament/NOM-17');
    });
  });

  describe('2. Prerendered Static HTML Verification (dist directory)', () => {
    it('prerenders exactly the 3 configured valid sample pages and 404.html', () => {
      const p1 = path.join(
        distDir,
        'medicament/abilify-maintena-400-mg-5f9a078862/index.html'
      );
      const p2 = path.join(
        distDir,
        'medicament/polaramine-5mg-ml-25271e978e/index.html'
      );
      const p3 = path.join(
        distDir,
        'medicament/astemizol-ratiopharm-10mg-f82f512d54/index.html'
      );
      const notFound = path.join(distDir, '404.html');

      expect(fs.existsSync(p1)).toBe(true);
      expect(fs.existsSync(p2)).toBe(true);
      expect(fs.existsSync(p3)).toBe(true);
      expect(fs.existsSync(notFound)).toBe(true);
    });

    it('NOM-4460 (Active) static HTML has verified fields, active list, and snapshot date before JS', () => {
      const file = path.join(
        distDir,
        'medicament/abilify-maintena-400-mg-5f9a078862/index.html'
      );
      const html = fs.readFileSync(file, 'utf8');

      // Record-specific Head tags
      expect(html).toContain(
        '<title>ABILIFY MAINTENA — 400 MG | PharmaSearch</title>'
      );
      expect(html).toContain(
        '<link rel="canonical" href="https://pharmasearch.indz.net/medicament/abilify-maintena-400-mg-5f9a078862/" />'
      );
      expect(html).toContain(
        '<meta property="og:title" content="ABILIFY MAINTENA — 400 MG | PharmaSearch" />'
      );
      expect(html).toContain(
        '<meta property="og:url" content="https://pharmasearch.indz.net/medicament/abilify-maintena-400-mg-5f9a078862/" />'
      );
      expect(html).toContain(
        '<meta name="twitter:title" content="ABILIFY MAINTENA — 400 MG | PharmaSearch" />'
      );
      expect(html).toContain(
        '<meta property="og:image" content="https://pharmasearch.indz.net/images/og-pharmasearch.png" />'
      );

      // Pre-rendered Crawlable Content inside <div id="root">
      expect(html).toContain('ABILIFY MAINTENA');
      expect(html).toContain('ARIPIPRAZOLE');
      expect(html).toContain('602/16 D 175/23');
      expect(html).toContain('16 D 175');
      expect(html).toContain('H.LUNDBECK A/S');
      expect(html).toContain('DANEMARK');
      expect(html).toContain('BOITE DE 01 SERINGUE');
      expect(html).toContain('Classification officielle : Nomenclature active');
      expect(html).toContain('31 Août 2026');
    });

    it('NON-13 (Non Renouvelé) static HTML displays non-renewed status and verified specs', () => {
      const file = path.join(
        distDir,
        'medicament/polaramine-5mg-ml-25271e978e/index.html'
      );
      const html = fs.readFileSync(file, 'utf8');

      expect(html).toContain(
        '<title>POLARAMINE — 5MG/ML | PharmaSearch</title>'
      );
      expect(html).toContain(
        '<link rel="canonical" href="https://pharmasearch.indz.net/medicament/polaramine-5mg-ml-25271e978e/" />'
      );
      expect(html).toContain('POLARAMINE');
      expect(html).toContain('DEXCHLORPHENIRAMINE MALEATE');
      expect(html).toContain('027/01 A 004/97');
      expect(html).toContain('SCHERING PLOUGH');
      expect(html).toContain('Classification officielle : Non renouvelé');
      expect(html).toContain('31 Août 2026');
    });

    it('RET-12 (Retrait) static HTML displays withdrawal status, date, reason, and snapshot', () => {
      const file = path.join(
        distDir,
        'medicament/astemizol-ratiopharm-10mg-f82f512d54/index.html'
      );
      const html = fs.readFileSync(file, 'utf8');

      expect(html).toContain(
        '<title>ASTEMIZOL RATIOPHARM — 10MG | PharmaSearch</title>'
      );
      expect(html).toContain(
        '<link rel="canonical" href="https://pharmasearch.indz.net/medicament/astemizol-ratiopharm-10mg-f82f512d54/" />'
      );
      expect(html).toContain('ASTEMIZOL RATIOPHARM');
      expect(html).toContain('ASTEMIZOLE');
      expect(html).toContain('156/01 A 001/99');
      expect(html).toContain('RATIOPHARM S.A.');
      expect(html).toContain('Classification officielle : Retiré');
      expect(html).toContain('Date de retrait');
      expect(html).toContain('07/03/2009');
      expect(html).toContain(
        'RETRAIT PAR LE MSPRH POUR INTERDICTION DU LABORATOIRE'
      );
      expect(html).toContain('31 Août 2026');
    });

    it('404.html static response contains noindex directive and helpful error content', () => {
      const notFound = path.join(distDir, '404.html');
      const html = fs.readFileSync(notFound, 'utf8');

      expect(html).toContain(
        '<title>Produit ou page introuvable | PharmaSearch</title>'
      );
      expect(html).toContain(
        '<meta name="robots" content="noindex, nofollow" />'
      );
      expect(html).toContain('404 — Produit ou référence introuvable');
      expect(html).toContain('Retour au registre national');
    });
  });
});
