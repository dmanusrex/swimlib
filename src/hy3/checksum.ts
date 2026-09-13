/**
 * HY3 line checksum.
 *
 * Every HY3 line is 130 characters: 128 characters of record content
 * followed by a 2-character checksum. This implements the documented Hy-Tek
 * algorithm:
 *
 *   1. Take the first 128 characters of the line (excluding the checksum).
 *   2. sum = Σ charCode(i) × 1 for even 0-based indexes, × 2 for odd.
 *   3. checkVal = floor(sum / 21) + 205.
 *   4. checksum = the last two decimal digits of checkVal, REVERSED
 *      (e.g. checkVal 337 → '37' → '73').
 *
 * Validated against two independent sources:
 *   - all 5 authentic sample rows in docs/formats/hytek_hy3_format.md
 *     reproduce exactly;
 */

import { CONTENT_LENGTH } from './config';

/**
 * Compute the 2-character checksum for a HY3 line. Only the first 128
 * characters are considered; anything beyond (including an existing
 * checksum) is ignored. Lines shorter than 128 characters are summed as-is
 * (callers should pad to full length first for spec-exact results).
 */
export function computeHy3Checksum(line: string): string {
  const content = line.slice(0, CONTENT_LENGTH);
  let sum = 0;
  for (let i = 0; i < content.length; i++) {
    sum += content.charCodeAt(i) * (i % 2 === 0 ? 1 : 2);
  }
  const checkVal = Math.floor(sum / 21) + 205;
  const lastTwo = String(checkVal % 100).padStart(2, '0');
  return lastTwo[1]! + lastTwo[0]!;
}
