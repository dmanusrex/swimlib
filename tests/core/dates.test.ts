import { describe, expect, it } from 'vitest';
import {
  formatMmddyy,
  formatMmddyyWithCentury,
  parseMmddyy,
  parseMmddyyWithCentury,
} from '../../src/core/dates';

describe('MMDDYY dates', () => {
  it('formats with zero padding', () => {
    expect(formatMmddyy({ year: 2023, month: 9, day: 4 })).toBe('090423');
  });

  it('parses assuming the current century', () => {
    const d = parseMmddyy('092423');
    expect(d.month).toBe(9);
    expect(d.day).toBe(24);
    expect(d.year % 100).toBe(23);
  });

  it('round-trips with an explicit century', () => {
    const d = parseMmddyyWithCentury('072499', '19');
    expect(d).toEqual({ year: 1999, month: 7, day: 24 });
    expect(formatMmddyyWithCentury(d)).toEqual({ mmddyy: '072499', century: '19' });
  });

  it('rejects malformed input', () => {
    expect(() => parseMmddyy('9/24/23')).toThrow(RangeError);
    expect(() => parseMmddyyWithCentury('092423', '2')).toThrow(RangeError);
  });
});
