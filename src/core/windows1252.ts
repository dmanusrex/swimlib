/**
 * Windows-1252 text codec.
 *
 * Hy-Tek file formats store text as Windows-1252. Bytes 0x00–0x7F and
 * 0xA0–0xFF map 1:1 to the same Unicode code points; 0x80–0x9F use the
 * table below.
 */

const DECODE_80_TO_9F: Record<number, string> = {
  0x80: '€',
  0x82: '‚',
  0x83: 'ƒ',
  0x84: '„',
  0x85: '…',
  0x86: '†',
  0x87: '‡',
  0x88: 'ˆ',
  0x89: '‰',
  0x8a: 'Š',
  0x8b: '‹',
  0x8c: 'Œ',
  0x8e: 'Ž',
  0x91: '‘',
  0x92: '’',
  0x93: '“',
  0x94: '”',
  0x95: '•',
  0x96: '–',
  0x97: '—',
  0x98: '˜',
  0x99: '™',
  0x9a: 'š',
  0x9b: '›',
  0x9c: 'œ',
  0x9e: 'ž',
  0x9f: 'Ÿ',
};

const ENCODE_80_TO_9F = new Map<string, number>(
  Object.entries(DECODE_80_TO_9F).map(([k, v]) => [v, Number(k)]),
);

/** Decode bytes as Windows-1252 text. */
export function decodeWindows1252(bytes: Uint8Array): string {
  let out = '';
  for (const b of bytes) {
    if (b >= 0x80 && b <= 0x9f && DECODE_80_TO_9F[b] !== undefined) {
      out += DECODE_80_TO_9F[b];
    } else {
      out += String.fromCharCode(b);
    }
  }
  return out;
}

/** Encode text as Windows-1252 bytes; throws for unmappable code points. */
export function encodeWindows1252(text: string, context: string): Uint8Array {
  const out = new Uint8Array(text.length);
  let i = 0;
  for (const ch of text) {
    const mapped = ENCODE_80_TO_9F.get(ch);
    if (mapped !== undefined) {
      out[i++] = mapped;
      continue;
    }
    const code = ch.charCodeAt(0);
    if (code <= 0xff) {
      out[i++] = code;
      continue;
    }
    throw new RangeError(
      `${context}: character ${JSON.stringify(ch)} is not representable in Windows-1252`,
    );
  }
  return out;
}
