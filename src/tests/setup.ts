import '@testing-library/jest-dom';
import { vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { populateSeoUrlMap } from '@/utils/seoRegistry';

// Mock window.scrollTo for jsdom
if (typeof window !== 'undefined') {
  window.scrollTo = vi.fn();
}

// Load the full-catalogue clean-URL map (the app loads it as a lazy chunk before render)
populateSeoUrlMap(
  JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/seo-url-map.json'), 'utf8'))
);
