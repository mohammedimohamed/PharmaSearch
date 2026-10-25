/**
 * Compact public URL map: recordId (e.g. "NOM-4460") -> "slug-urlKey".
 * Generated from the committed persistent registry (seo/seo-url-registry.json)
 * by scripts/generate-seo-registry.ts. The recordId is the current source-row
 * identifier; the urlKey is the permanent public URL key and is independent of it.
 */

// Map from public URL key (e.g. "5f9a078862") -> recordId ("NOM-4460")
export const KEY_TO_RECORD_ID = new Map<string, string>();

// Map from recordId ("NOM-4460") -> canonicalPath ("/medicament/abilify-maintena-400-mg-5f9a078862/")
export const RECORD_ID_TO_CANONICAL_PATH = new Map<string, string>();

/**
 * Populates the lookup maps. In the app this is called once before first render with the lazily
 * loaded map chunk (see main.tsx) so the ~400 kB map is not part of the main bundle.
 */
export function populateSeoUrlMap(urlMap: Record<string, string>): void {
  for (const [recordId, slugKey] of Object.entries(urlMap)) {
    const urlKey = slugKey.slice(-10);
    KEY_TO_RECORD_ID.set(urlKey, recordId);
    RECORD_ID_TO_CANONICAL_PATH.set(recordId, `/medicament/${slugKey}/`);
  }
}

/**
 * Extracts a public URL key from a route path.
 * Matches patterns like:
 *   /medicament/abilify-maintena-400-mg-5f9a078862/
 *   /medicament/abilify-maintena-400-mg-5f9a078862
 *   /medicament/5f9a078862
 */
export function extractUrlKeyFromPath(path: string): string | null {
  const clean = path.replace(/^\/medicament\/?/, '').replace(/\/+$/, '');
  if (!clean) return null;

  // Pattern: slug followed by hyphen and 10-hex key at the end, or standalone key
  const match = clean.match(/(?:^|-)([a-f0-9]{10})$/i);
  if (match) {
    return match[1].toLowerCase();
  }
  return null;
}

/**
 * Resolves any medicament identifier (clean URL key, canonical path, or legacy recordId)
 * to the authoritative current recordId. Unknown identifiers are returned unchanged so
 * that they never resolve to another record.
 */
export function resolveToRecordId(identifier: string): string {
  if (!identifier) return '';

  // 1. If it's already an active internal recordId (NOM-xxx, NON-xxx, RET-xxx), return directly
  if (/^(NOM|NON|RET)-\d+$/i.test(identifier)) {
    return identifier.toUpperCase();
  }

  // 2. Try extract URL key
  const key = extractUrlKeyFromPath(identifier) || identifier.toLowerCase();
  const mapped = KEY_TO_RECORD_ID.get(key);
  if (mapped) {
    return mapped;
  }

  return identifier;
}

/**
 * Returns the canonical clean path only when a registry entry exists;
 * otherwise returns null.
 */
export function getCanonicalPathForRecord(recordId: string): string | null {
  return RECORD_ID_TO_CANONICAL_PATH.get(recordId) || null;
}

/**
 * Returns the registered clean path if available;
 * otherwise returns the supported hash-based URL (e.g. /#/medicament/NOM-17).
 */
export function getHrefForRecord(recordId: string): string {
  const cleanPath = RECORD_ID_TO_CANONICAL_PATH.get(recordId);
  if (cleanPath) {
    return cleanPath;
  }
  return `/#/medicament/${recordId}`;
}
