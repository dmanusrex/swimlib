/** Calendar date (no timezone). */
export interface CalendarDate {
  readonly year: number;
  readonly month: number;
  readonly day: number;
}

/** Format a calendar date as the 6-digit MMDDYY used throughout Hy-Tek formats. */
export function formatMmddyy(d: CalendarDate): string {
  const mm = String(d.month).padStart(2, '0');
  const dd = String(d.day).padStart(2, '0');
  const yy = String(d.year % 100).padStart(2, '0');
  return `${mm}${dd}${yy}`;
}

/**
 * Parse a 6-digit MMDDYY date. The century is not stored in this
 * representation; the current century is assumed.
 */
export function parseMmddyy(text: string): CalendarDate {
  if (text.length !== 6 || !/^\d{6}$/.test(text)) {
    throw new RangeError(`date must be 6 digits MMDDYY, got ${JSON.stringify(text)}`);
  }
  const mm = Number(text.slice(0, 2));
  const dd = Number(text.slice(2, 4));
  const yy = Number(text.slice(4, 6));
  const currentCentury = Math.floor(new Date().getUTCFullYear() / 100);
  const year = currentCentury * 100 + yy;
  return { year, month: mm, day: dd };
}

/** Parse a MMDDYY date with an explicit 2-digit century (e.g. '19', '20'). */
export function parseMmddyyWithCentury(text: string, century: string): CalendarDate {
  if (text.length !== 6 || !/^\d{6}$/.test(text)) {
    throw new RangeError(`date must be 6 digits MMDDYY, got ${JSON.stringify(text)}`);
  }
  if (century.length !== 2 || !/^\d{2}$/.test(century)) {
    throw new RangeError(`century must be 2 digits, got ${JSON.stringify(century)}`);
  }
  const mm = Number(text.slice(0, 2));
  const dd = Number(text.slice(2, 4));
  const yy = Number(text.slice(4, 6));
  return { year: Number(century) * 100 + yy, month: mm, day: dd };
}

/** Split a calendar date into its MMDDYY and 2-digit century parts. */
export function formatMmddyyWithCentury(d: CalendarDate): { mmddyy: string; century: string } {
  if (!Number.isInteger(d.year) || d.year < 0 || d.year > 9999) {
    throw new RangeError(`year must be 0..9999, got ${d.year}`);
  }
  return { mmddyy: formatMmddyy(d), century: String(Math.floor(d.year / 100)).padStart(2, '0') };
}
