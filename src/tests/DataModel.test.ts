import { describe, it, expect } from 'vitest';
import { parseSourceDate } from '@/utils/date';

describe('Data Model & Date Normalization', () => {
  it('converts valid Excel numeric serial dates to ISO and formatted strings', () => {
    // 38929 in Excel 1900 date system = 2006-07-31
    const res = parseSourceDate('38929');
    expect(res.isInvalidDate).toBe(false);
    expect(res.isAdministrativeTag).toBe(false);
    expect(res.isoDate).toBe('2006-07-31');
    expect(res.formatted).toBe('31/07/2006');
    expect(res.raw).toBe('38929');
  });

  it('preserves administrative tags like "RETRAIT" and "ABROGATION" in date column', () => {
    const resRetrait = parseSourceDate('RETRAIT');
    expect(resRetrait.isAdministrativeTag).toBe(true);
    expect(resRetrait.isInvalidDate).toBe(false);
    expect(resRetrait.formatted).toBe('RETRAIT');
    expect(resRetrait.raw).toBe('RETRAIT');

    const resAbrog = parseSourceDate('ABROGATION');
    expect(resAbrog.isAdministrativeTag).toBe(true);
    expect(resAbrog.formatted).toBe('ABROGATION');
  });

  it('flags incomplete or invalid dates like "00/00/2019" with warnings instead of fabricating', () => {
    const res = parseSourceDate('00/00/2019');
    expect(res.isInvalidDate).toBe(true);
    expect(res.isoDate).toBeNull();
    expect(res.formatted).toBe('00/00/2019');
    expect(res.raw).toBe('00/00/2019');
    expect(res.warning).toBeDefined();
    expect(res.warning).toContain('incomplète ou invalide');
  });

  it('handles empty, null, or whitespace values gracefully', () => {
    const resEmpty = parseSourceDate('');
    expect(resEmpty.raw).toBe('');
    expect(resEmpty.isoDate).toBeNull();
    expect(resEmpty.formatted).toBeNull();
    expect(resEmpty.isInvalidDate).toBe(false);

    const resNull = parseSourceDate(null);
    expect(resNull.raw).toBe('');
    expect(resNull.isoDate).toBeNull();
  });
});
