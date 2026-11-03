import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import fs from 'fs';
import path from 'path';

import previewDataRaw from '@/data/b2b-insights-preview.json';
import { InsightsPage } from '@/pages/InsightsPage';
import { I18nProvider } from '@/context/I18nContext';
import { RouterProvider } from '@/router/RouterContext';
import { App } from '@/App';

describe('B2B Market Insights & Aperçu (Statistical Value Proposition)', () => {
  it('1. Dataset integrity: Public preview data is sanitized, compact, and accurate', () => {
    expect(previewDataRaw).toBeDefined();
    const kpis = previewDataRaw.headlineKpis;

    expect(kpis.totalRecords).toBe(9595);
    expect(kpis.activeRecords).toBe(5425);
    expect(kpis.localManufacturingPct).toBe(74.2);
    expect(kpis.importPct).toBe(25.8);
    expect(kpis.importOnlyDcisCount).toBe(493);
    expect(kpis.monopolyDcisCount).toBe(649);
    expect(kpis.orphanedDcisCount).toBe(844);
    expect(kpis.activeLaboratoriesCount).toBe(538);
    expect(kpis.historicalEditionsCount).toBe(13);

    // Verify sample teaser restrictions (client bundle only gets 5 preview items, not the full dataset)
    expect(previewDataRaw.therapeuticSovereigntyPreview.topLocalClasses.length).toBeLessThanOrEqual(5);
    expect(previewDataRaw.therapeuticSovereigntyPreview.lockedRemainingClassesCount).toBeGreaterThan(0);

    expect(previewDataRaw.laboratoriesBenchmarkingPreview.topPlayers.length).toBeLessThanOrEqual(5);
    expect(previewDataRaw.laboratoriesBenchmarkingPreview.lockedRemainingLabsCount).toBeGreaterThan(500);

    expect(previewDataRaw.importOnlyTargetsPreview.sampleMolecules.length).toBeLessThanOrEqual(5);
    expect(previewDataRaw.importOnlyTargetsPreview.lockedRemainingDcisCount).toBe(488);

    expect(previewDataRaw.partnerInfo.advisorName).toBe('TechWise Advisors');
    expect(previewDataRaw.partnerInfo.advisorWebsite).toBe('https://techwise-dz.com/');
  });

  it('2. Local full proprietary report generated locally and ignored from git', () => {
    const fullJsonPath = path.resolve('reports/pharmasearch-b2b-full-intelligence-report.json');
    const fullMdPath = path.resolve('reports/pharmasearch-b2b-full-intelligence-report.md');

    expect(fs.existsSync(fullJsonPath)).toBe(true);
    expect(fs.existsSync(fullMdPath)).toBe(true);

    const fullData = JSON.parse(fs.readFileSync(fullJsonPath, 'utf8'));
    expect(fullData.pillar2_RndAndWhiteSpaces.importOnlyDcisTotal).toBe(493);
    expect(fullData.pillar2_RndAndWhiteSpaces.importOnlyDcisList.length).toBe(493);
    expect(fullData.pillar3_LaboratoryBenchmarking.totalLaboratories).toBe(538);
    expect(fullData.pillar3_LaboratoryBenchmarking.laboratoriesRanking.length).toBe(538);

    // Verify .gitignore contains reports/
    const gitignoreContent = fs.readFileSync('.gitignore', 'utf8');
    expect(gitignoreContent).toContain('reports/');
  });

  it('3. UI Component: InsightsPage renders KPIs, teaser badges, and locked teasers in French', () => {
    render(
      <RouterProvider>
        <I18nProvider>
          <InsightsPage />
        </I18nProvider>
      </RouterProvider>
    );

    // Badges & Titles
    expect(screen.getByText('Aperçu Exclusif B2B')).toBeInTheDocument();
    expect(screen.getByText(/Observatoire & Statistiques/i)).toBeInTheDocument();

    // KPIs
    expect(screen.getByText('5 425')).toBeInTheDocument();
    expect(screen.getByText('74.2%')).toBeInTheDocument();
    expect(screen.getByText('493')).toBeInTheDocument();
    expect(screen.getByText('649')).toBeInTheDocument();

    // TechWise Advisors CTAs
    const partnerLinks = screen.getAllByRole('link', { name: /TechWise Advisors/i });
    expect(partnerLinks.length).toBeGreaterThan(0);
    const mainWebsiteLink = partnerLinks.find((l) => l.getAttribute('href') === 'https://techwise-dz.com/');
    expect(mainWebsiteLink).toBeDefined();
  });

  it('4. UI Component: InsightsPage renders RTL and Arabic translations', () => {
    localStorage.setItem('pharmasearch_lang', 'ar');

    const { container } = render(
      <RouterProvider>
        <I18nProvider>
          <InsightsPage />
        </I18nProvider>
      </RouterProvider>
    );

    const mainEl = container.querySelector('main');
    expect(mainEl).toHaveAttribute('dir', 'rtl');
    expect(screen.getByText('معاينة حصرية B2B')).toBeInTheDocument();
    expect(screen.getByText(/المرصد التنظيمي وإحصائيات السوق الصيدلانية/i)).toBeInTheDocument();

    localStorage.removeItem('pharmasearch_lang');
  });

  it('5. Router integration: /statistiques route renders InsightsPage and sets page title', () => {
    window.location.hash = '#/statistiques';

    render(<App />);

    expect(screen.getByText('Aperçu Exclusif B2B')).toBeInTheDocument();
    expect(document.title).toBe('Observatoire & Statistiques Marché | PharmaSearch');
  });
});
