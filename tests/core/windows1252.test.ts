import { describe, expect, it } from 'vitest';
import { decodeWindows1252, encodeWindows1252 } from '../../src/core/windows1252';

describe('windows-1252 codec', () => {
  it('round-trips ASCII text', () => {
    const text = 'Plain ASCII 0123456789';
    expect(decodeWindows1252(encodeWindows1252(text, 'test'))).toBe(text);
  });

  it('encodes the 0x80-0x9F specials', () => {
    const bytes = encodeWindows1252('Café™', 'test');
    expect(Array.from(bytes)).toEqual([0x43, 0x61, 0x66, 0xe9, 0x99]);
  });

  it('decodes the 0x80-0x9F specials', () => {
    expect(decodeWindows1252(new Uint8Array([0x80, 0x99, 0x9c]))).toBe('€™œ');
  });

  it('round-trips every mappable byte', () => {
    // Bytes 0x81, 0x8D, 0x8F, 0x90, 0x9D are unassigned in Windows-1252 and
    // pass through as their own code points, so the full range round-trips.
    const all = new Uint8Array(256);
    for (let i = 0; i < 256; i++) all[i] = i;
    expect(encodeWindows1252(decodeWindows1252(all), 'test')).toEqual(all);
  });

  it('throws for unmappable characters', () => {
    expect(() => encodeWindows1252('日本', 'holder')).toThrow(/holder/);
  });
});
