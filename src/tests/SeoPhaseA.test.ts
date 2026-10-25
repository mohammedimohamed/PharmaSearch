import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('SEO Phase A: Foundations, Canonicalization & Metadata', () => {
  const rootDir = path.resolve(__dirname, '../../');
  const indexHtmlPath = path.join(rootDir, 'index.html');
  const robotsTxtPath = path.join(rootDir, 'public/robots.txt');
  const vercelJsonPath = path.join(rootDir, 'vercel.json');
  const faviconIcoPath = path.join(rootDir, 'public/favicon.ico');
  const faviconSvgPath = path.join(rootDir, 'public/favicon.svg');
  const ogImagePath = path.join(rootDir, 'public/images/og-pharmasearch.png');

  it('1. index.html contains canonical, Open Graph, Twitter, and WebSite JSON-LD metadata', () => {
    expect(fs.existsSync(indexHtmlPath)).toBe(true);
    const html = fs.readFileSync(indexHtmlPath, 'utf8');

    // Canonical link
    expect(html).toContain('<link rel="canonical" href="https://pharmasearch.indz.net/" />');

    // Favicon links
    expect(html).toContain('<link rel="icon" type="image/svg+xml" href="/favicon.svg" />');
    expect(html).toContain('<link rel="alternate icon" href="/favicon.ico" />');

    // Open Graph base tags
    expect(html).toContain('<meta property="og:site_name" content="PharmaSearch" />');
    expect(html).toContain('<meta property="og:title" content="PharmaSearch — Registre Pharmaceutique National" />');
    expect(html).toContain('<meta property="og:url" content="https://pharmasearch.indz.net/" />');
    expect(html).toContain('<meta property="og:type" content="website" />');
    expect(html).toContain('<meta property="og:locale" content="fr_DZ" />');
    expect(html).toContain('<meta property="og:image" content="https://pharmasearch.indz.net/images/og-pharmasearch.png" />');
    expect(html).toContain('<meta property="og:image:width" content="1200" />');
    expect(html).toContain('<meta property="og:image:height" content="630" />');

    // Deferred Arabic alternate verification (must NOT be present in Phase A)
    expect(html).not.toContain('og:locale:alternate');

    // Twitter tags
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image" />');
    expect(html).toContain('<meta name="twitter:title" content="PharmaSearch — Registre Pharmaceutique National" />');
    expect(html).toContain('<meta name="twitter:image" content="https://pharmasearch.indz.net/images/og-pharmasearch.png" />');

    // Structured data (WebSite only, TechWise Advisors as sponsor, no standalone PharmaSearch Organization)
    expect(html).toContain('"@type": "WebSite"');
    expect(html).toContain('"sponsor"');
    expect(html).toContain('"TechWise Advisors"');
    expect(html).not.toContain('"@type": "Organization"\n      "name": "PharmaSearch"');

    // Ensure valid JSON-LD parsing
    const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    expect(jsonLdMatch).toBeTruthy();
    const parsed = JSON.parse(jsonLdMatch![1]);
    expect(parsed['@context']).toBe('https://schema.org');
    expect(parsed['@type']).toBe('WebSite');
    expect(parsed.url).toBe('https://pharmasearch.indz.net/');
    expect(parsed.sponsor.name).toBe('TechWise Advisors');
  });

  it('2. public/robots.txt allows general crawling and declares the catalogue sitemap (now generated) and no hash rules', () => {
    expect(fs.existsSync(robotsTxtPath)).toBe(true);
    const robots = fs.readFileSync(robotsTxtPath, 'utf8');

    expect(robots).toContain('User-agent: *');
    expect(robots).toContain('Allow: /');
    // Sitemap is declared only because it is generated at build time (see SeoPhaseC catalogue tests)
    expect(robots).toContain('Sitemap: https://pharmasearch.indz.net/sitemap.xml');
    expect(robots).not.toContain('#');
  });

  it('3. vercel.json configures host-specific permanent redirect for production alias only', () => {
    expect(fs.existsSync(vercelJsonPath)).toBe(true);
    const vercelConfig = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'));

    expect(vercelConfig.redirects).toBeDefined();
    expect(Array.isArray(vercelConfig.redirects)).toBe(true);

    const aliasRedirect = vercelConfig.redirects.find((r: { source: string }) => r.source === '/:path*');
    expect(aliasRedirect).toBeDefined();
    expect(aliasRedirect.permanent).toBe(true);
    expect(aliasRedirect.destination).toBe('https://pharmasearch.indz.net/:path*');
    expect(aliasRedirect.has).toEqual([
      {
        type: 'host',
        value: 'pharmasearch-tau.vercel.app',
      },
    ]);
  });

  it('4. Favicons and Open Graph image exist, are non-empty, and match dimensions', () => {
    expect(fs.existsSync(faviconSvgPath)).toBe(true);
    expect(fs.statSync(faviconSvgPath).size).toBeGreaterThan(50);

    expect(fs.existsSync(faviconIcoPath)).toBe(true);
    expect(fs.statSync(faviconIcoPath).size).toBeGreaterThan(100);

    expect(fs.existsSync(ogImagePath)).toBe(true);
    const ogBuf = fs.readFileSync(ogImagePath);
    expect(ogBuf.length).toBeGreaterThan(1000);

    // PNG signature
    expect(ogBuf[0]).toBe(137);
    expect(ogBuf[1]).toBe(80);
    expect(ogBuf[2]).toBe(78);
    expect(ogBuf[3]).toBe(71);

    // IHDR width & height: 1200 x 630
    const width = ogBuf.readUInt32BE(16);
    const height = ogBuf.readUInt32BE(20);
    expect(width).toBe(1200);
    expect(height).toBe(630);
  });
});
