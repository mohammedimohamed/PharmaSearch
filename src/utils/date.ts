import type { RawDateValue } from '../types';

/**
 * Converts an ExcelJS Date object, Excel serial number, or raw string into a structured RawDateValue.
 * Strictly preserves raw source content and flags administrative tags / invalid dates.
 */
export function parseSourceDate(raw: string | number | Date | undefined | null): RawDateValue {
  if (raw === undefined || raw === null) {
    return {
      raw: '',
      isoDate: null,
      formatted: null,
      isInvalidDate: false,
      isAdministrativeTag: false,
    };
  }

  // Handle native Date object (e.g. produced by ExcelJS parser)
  if (raw instanceof Date) {
    if (isNaN(raw.getTime())) {
      return {
        raw: 'Invalid Date',
        isoDate: null,
        formatted: 'Invalid Date',
        isInvalidDate: true,
        isAdministrativeTag: false,
        warning: 'Objet Date JavaScript invalide',
      };
    }
    const year = raw.getUTCFullYear();
    const month = String(raw.getUTCMonth() + 1).padStart(2, '0');
    const day = String(raw.getUTCDate()).padStart(2, '0');
    const isoDate = `${year}-${month}-${day}`;
    const formatted = `${day}/${month}/${year}`;
    return {
      raw: formatted,
      isoDate,
      formatted,
      isInvalidDate: false,
      isAdministrativeTag: false,
    };
  }

  const rawStr = String(raw).trim();

  if (!rawStr) {
    return {
      raw: '',
      isoDate: null,
      formatted: null,
      isInvalidDate: false,
      isAdministrativeTag: false,
    };
  }

  // Check for known administrative tags in the date column (e.g. in Retraits)
  const upper = rawStr.toUpperCase();
  if (
    upper === 'RETRAIT' ||
    upper === 'ABROGATION' ||
    upper.includes('RETRAIT') ||
    upper.includes('ABROGATION')
  ) {
    return {
      raw: rawStr,
      isoDate: null,
      formatted: rawStr,
      isInvalidDate: false,
      isAdministrativeTag: true,
    };
  }

  // Check if it's a numeric Excel serial date
  const numericVal = Number(rawStr);
  if (!isNaN(numericVal) && numericVal > 0 && isFinite(numericVal)) {
    try {
      // Excel 1900 date system epoch adjustment (1899-12-30 accounts for Lotus 1-2-3 1900 leap year bug)
      const epoch = new Date(Date.UTC(1899, 11, 30));
      const targetTime = epoch.getTime() + numericVal * 86400000;
      const date = new Date(targetTime);

      if (!isNaN(date.getTime()) && date.getUTCFullYear() >= 1900 && date.getUTCFullYear() <= 2100) {
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');

        return {
          raw: rawStr,
          isoDate: `${year}-${month}-${day}`,
          formatted: `${day}/${month}/${year}`,
          isInvalidDate: false,
          isAdministrativeTag: false,
        };
      }
    } catch {
      // Fallback to invalid date handling below
    }
  }

  // Handle explicit calendar date strings (e.g., DD/MM/YYYY)
  const ddmmyyyyMatch = rawStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (ddmmyyyyMatch) {
    const [, d, m, y] = ddmmyyyyMatch;
    const day = parseInt(d, 10);
    const month = parseInt(m, 10);
    const year = parseInt(y, 10);

    // Check for malformed dates like 00/00/2019
    if (day === 0 || month === 0 || month > 12 || day > 31) {
      return {
        raw: rawStr,
        isoDate: null,
        formatted: rawStr,
        isInvalidDate: true,
        isAdministrativeTag: false,
        warning: `Date incomplète ou invalide dans le classeur source: "${rawStr}"`,
      };
    }

    const padDay = String(day).padStart(2, '0');
    const padMonth = String(month).padStart(2, '0');

    return {
      raw: rawStr,
      isoDate: `${year}-${padMonth}-${padDay}`,
      formatted: `${padDay}/${padMonth}/${year}`,
      isInvalidDate: false,
      isAdministrativeTag: false,
    };
  }

  // Any other non-empty string that cannot be parsed
  return {
    raw: rawStr,
    isoDate: null,
    formatted: rawStr,
    isInvalidDate: true,
    isAdministrativeTag: false,
    warning: `Format de date non reconnu dans le classeur source: "${rawStr}"`,
  };
}
