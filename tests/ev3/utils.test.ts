import { describe, expect, it } from 'vitest';
import {
  cleanField,
  decodeStroke,
  normalizeGender,
  parseIntWithDefault,
  timeFromString,
} from '../../src/ev3/index';

describe('timeFromString', () => {
  it('converts MM:SS.HH format', () => {
    expect(timeFromString('1:23.45')).toBe(8345);
    expect(timeFromString('10:00.00')).toBe(60000);
  });

  it('converts SS.HH format', () => {
    expect(timeFromString('23.45')).toBe(2345);
    expect(timeFromString('5.00')).toBe(500);
  });

  it('passes through bare centiseconds', () => {
    expect(timeFromString('8345')).toBe(8345);
  });

  it('returns 0 for empty or zero times', () => {
    expect(timeFromString('')).toBe(0);
    expect(timeFromString('0.00')).toBe(0);
    expect(timeFromString('   ')).toBe(0);
  });

  it('returns 0 for unparseable input', () => {
    expect(timeFromString('fast')).toBe(0);
  });
});

describe('normalizeGender', () => {
  it('maps M/B to M', () => {
    expect(normalizeGender('M')).toBe('M');
    expect(normalizeGender('B')).toBe('M');
    expect(normalizeGender('b')).toBe('M');
  });

  it('maps F/W/G to F', () => {
    expect(normalizeGender('F')).toBe('F');
    expect(normalizeGender('W')).toBe('F');
    expect(normalizeGender('G')).toBe('F');
    expect(normalizeGender('g')).toBe('F');
  });

  it('passes unknown codes through', () => {
    expect(normalizeGender('X')).toBe('X');
  });
});

describe('cleanField', () => {
  it('trims values and handles missing input', () => {
    expect(cleanField('  hello  ')).toBe('hello');
    expect(cleanField(undefined)).toBe('');
    expect(cleanField('')).toBe('');
  });
});

describe('parseIntWithDefault', () => {
  it('parses integers with defaults', () => {
    expect(parseIntWithDefault('42')).toBe(42);
    expect(parseIntWithDefault('')).toBe(0);
    expect(parseIntWithDefault('abc', 7)).toBe(7);
  });
});

describe('decodeStroke', () => {
  it('decodes individual strokes', () => {
    expect(decodeStroke('A')).toBe('Free');
    expect(decodeStroke('B')).toBe('Back');
    expect(decodeStroke('C')).toBe('Breast');
    expect(decodeStroke('D')).toBe('Fly');
    expect(decodeStroke('E')).toBe('IM');
  });

  it('decodes diving events', () => {
    expect(decodeStroke('F')).toBe('Diving 1M');
    expect(decodeStroke('G')).toBe('Diving 3M');
    expect(decodeStroke('H')).toBe('Diving 10M');
  });

  it('derives relay names from the base stroke + ind_or_relay flag', () => {
    expect(decodeStroke('A', 'R')).toBe('Free Relay');
    expect(decodeStroke('E', 'R')).toBe('Medley Relay');
    expect(decodeStroke('A', 'I')).toBe('Free');
    expect(decodeStroke('A')).toBe('Free');
  });

  it('is case insensitive', () => {
    expect(decodeStroke('a')).toBe('Free');
    expect(decodeStroke('b')).toBe('Back');
    expect(decodeStroke('e', 'r')).toBe('Medley Relay');
  });

  it('passes unknown codes through', () => {
    expect(decodeStroke('X')).toBe('X');
    expect(decodeStroke('')).toBe('');
    expect(decodeStroke('unknown')).toBe('unknown');
  });
});
