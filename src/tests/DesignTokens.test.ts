import { describe, it, expect } from 'vitest';
import tailwindConfig from '../../tailwind.config';

describe('Design Tokens Configuration against DESIGN.md', () => {
  const theme = tailwindConfig.theme?.extend;

  it('matches primary brand palette tokens from DESIGN.md', () => {
    const colors = theme?.colors as Record<string, unknown>;
    expect(colors['primary']).toBe('#005c55');
    expect(colors['primary-container']).toBe('#0f766e');
    expect(colors['surface']).toBe('#f9f9ff');
    expect(colors['surface-container']).toBe('#e7eeff');
    expect(colors['surface-container-lowest']).toBe('#ffffff');
    expect(colors['on-surface']).toBe('#111c2d');
    expect(colors['outline']).toBe('#6e7977');
    expect(colors['error']).toBe('#ba1a1a');
  });

  it('matches regulatory status badge tokens from DESIGN.md', () => {
    const colors = theme?.colors as Record<string, Record<string, Record<string, string>>>;
    expect(colors.status.active.bg).toBe('#DCFCE7');
    expect(colors.status.active.border).toBe('#86EFAC');
    expect(colors.status.active.text).toBe('#15803D');

    expect(colors.status.nonRenewed.bg).toBe('#FEF3C7');
    expect(colors.status.nonRenewed.border).toBe('#FCD34D');
    expect(colors.status.nonRenewed.text).toBe('#B45309');

    expect(colors.status.withdrawn.bg).toBe('#FEE2E2');
    expect(colors.status.withdrawn.border).toBe('#FCA5A5');
    expect(colors.status.withdrawn.text).toBe('#B91C1C');
  });

  it('matches spacing scale tokens from DESIGN.md', () => {
    const spacing = theme?.spacing as Record<string, string>;
    expect(spacing['space-xs']).toBe('0.25rem');
    expect(spacing['space-sm']).toBe('0.5rem');
    expect(spacing['space-md']).toBe('1rem');
    expect(spacing['space-lg']).toBe('1.5rem');
    expect(spacing['space-xl']).toBe('2rem');
    expect(spacing['gutter']).toBe('1.5rem');
  });

  it('matches border radius tokens from DESIGN.md', () => {
    const borderRadius = theme?.borderRadius as Record<string, string>;
    expect(borderRadius['sm']).toBe('0.25rem');
    expect(borderRadius['DEFAULT']).toBe('0.5rem');
    expect(borderRadius['md']).toBe('0.75rem');
    expect(borderRadius['lg']).toBe('1rem');
    expect(borderRadius['xl']).toBe('1.5rem');
    expect(borderRadius['full']).toBe('9999px');
  });
});
