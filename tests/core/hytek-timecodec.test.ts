import { describe, expect, it } from 'vitest';
import { decodeHytekTime, encodeHytekTime } from '../../src/core/hytek-timecodec';

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/\s/g, '');
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = Number.parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

// Golden vectors captured from real Hy-Tek .REC files.
const cases: { hex: string; seconds: number }[] = [
  { hex: '66 66 3C 85', seconds: 23.55 },
  { hex: '3D 0A 5B 86', seconds: 54.76 },
  { hex: 'A4 70 74 86', seconds: 61.11 },
  { hex: 'E1 BA 05 88', seconds: 133.73 },
  { hex: '71 0D 6F 8A', seconds: 956.21 },
];

describe('hytek time codec', () => {
  it.each(cases)('decodes $hex to $seconds', ({ hex, seconds }) => {
    expect(Math.abs(decodeHytekTime(hexToBytes(hex)) - seconds)).toBeLessThan(1e-4);
  });

  it.each(cases)('encode round-trips $hex', ({ hex }) => {
    const bytes = hexToBytes(hex);
    expect(encodeHytekTime(decodeHytekTime(bytes))).toEqual(bytes);
  });

  it('rejects wrong-length input', () => {
    expect(() => decodeHytekTime(new Uint8Array(3))).toThrow(RangeError);
  });

  it('rejects negative times', () => {
    expect(() => encodeHytekTime(-1)).toThrow(RangeError);
  });
});
