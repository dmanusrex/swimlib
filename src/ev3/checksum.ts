/**
 * EV3 header checksum.
 *
 * The checksum (the final `check_digit` header field) is computed over the
 * raw header line up to — but not including — the final `;check_digit`
 * separator. It is only defined for lines of at least 128 characters.
 *
 * Algorithm:
 *  1. Sum the char codes of every character in the line.
 *  2. Compute `trunc((sum - 4) / 9) + 52`, zero-padded to 4 digits.
 *  3. Result is `digit[3] + digits[0..2] + line[2]`.
 */
export function calculateEv3Checksum(line: string): string {
  if (!line || line.length < 128) {
    return '';
  }

  let sum = 0;
  for (let i = 0; i < line.length; i++) {
    sum += line.charCodeAt(i);
  }

  const str = (Math.trunc((sum - 4) / 9) + 52).toString().padStart(4, '0');
  return `${str.charAt(3)}${str.substring(0, 3)}${line.charAt(2)}`;
}
