import { describe, expect, it } from 'vitest';
import { computeHy3Checksum } from '../../src/hy3/checksum';
import { RECORD_TYPES, RECORD_LENGTH } from '../../src/hy3/index';

/**
 * Deterministic vectors computed by hand-running the documented algorithm
 * (sum with ×1/×2 alternating weights, ÷21, +205, last two digits reversed).
 * The algorithm is validated by two independent sources: all 5 authentic
 * sample rows in docs/formats/hytek_hy3_format.md reproduce exactly.
 */
describe('computeHy3Checksum', () => {
  it('returns known values for hand-computed vectors', () => {
    // 128 spaces: sum = 32×64 + 64×64 = 6144; floor(6144/21)+205 = 497 → '97' → '79'
    expect(computeHy3Checksum(' '.repeat(128))).toBe('79');
    // 'A1' + 126 spaces: 65 + 49×2 + 63×32 + 63×64 = 6211; 295+205 = 500 → '00' → '00'
    expect(computeHy3Checksum('A1' + ' '.repeat(126))).toBe('00');
    // 128 × 'A': 64×65 + 64×130 = 12480; 594+205 = 799 → '99' → '99'
    expect(computeHy3Checksum('A'.repeat(128))).toBe('99');
    // digit cycle
    expect(computeHy3Checksum('0123456789'.repeat(13).slice(0, 128))).toBe('58');
  });

  it('demonstrates the digit reversal (checkVal 337 → "73")', () => {
    // 'B' (66×1) + '1' (49×2) = 164; floor(164/21)+205 = 212 → '12' → '21'
    expect(computeHy3Checksum('B1')).toBe('21');
  });

  it('always returns exactly two digits', () => {
    for (const line of ['', 'A1', ' '.repeat(128), 'Z'.repeat(200)]) {
      const checksum = computeHy3Checksum(line);
      expect(checksum).toMatch(/^\d{2}$/);
    }
  });

  it('ignores characters beyond position 128 (existing checksums do not feed back)', () => {
    const content = 'B1Test Meet'.padEnd(128, ' ');
    const checksum = computeHy3Checksum(content);
    expect(computeHy3Checksum(content + checksum)).toBe(checksum);
    expect(computeHy3Checksum(content + 'XX')).toBe(checksum);
  });

  it('every record type embeds a checksum that verifies (symmetry)', () => {
    for (const Model of Object.values(RECORD_TYPES)) {
      const line = new Model().toRecord();
      expect(line.length).toBe(RECORD_LENGTH);
      expect(line.substring(128, 130)).toBe(computeHy3Checksum(line));
    }
  });
});
