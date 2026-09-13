/** Utility functions for EV3 parsing. */

/**
 * Parse a time string and convert to centiseconds (hundredths of a second).
 * Accepts `MM:SS.HH`, `SS.HH`, or a bare centiseconds integer; empty or
 * unparseable input yields 0.
 */
export function timeFromString(timeStr: string): number {
  if (!timeStr || timeStr === '0.00' || timeStr.trim() === '') {
    return 0;
  }

  if (/^\d+$/.test(timeStr)) {
    return parseInt(timeStr, 10);
  }

  const timeRegex = /^(?:(\d{1,2}):)?(\d{1,2})\.(\d{2})$/;
  const match = timeRegex.exec(timeStr);
  if (!match) {
    return 0;
  }

  const minutes = match[1] ? parseInt(match[1], 10) : 0;
  const seconds = parseInt(match[2]!, 10);
  const hundredths = parseInt(match[3]!, 10);
  return minutes * 60 * 100 + seconds * 100 + hundredths;
}

/** Normalize gender codes: M/B → M, F/W/G → F; unknown codes pass through. */
export function normalizeGender(gender: string): string {
  const upper = gender.toUpperCase();
  if (upper === 'M' || upper === 'B') return 'M';
  if (upper === 'F' || upper === 'W' || upper === 'G') return 'F';
  return gender;
}

/** Trim a delimited field value, treating missing values as empty. */
export function cleanField(value: string | undefined): string {
  if (value === undefined || value === null) {
    return '';
  }
  return value.trim();
}

/** Parse an integer with a default for empty/invalid input. */
export function parseIntWithDefault(value: string, defaultValue = 0): number {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}
