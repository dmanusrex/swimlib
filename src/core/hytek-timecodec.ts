/**
 * Hy-Tek modified IEEE-754 float32 time encoding (4 bytes, little-endian),
 * used by the binary .REC and .STD/.ST2 formats. Identical to float32
 * except the biased exponent byte is stored offset by +2.
 */

const U32 = new Uint32Array(1);
const F32 = new Float32Array(U32.buffer);
const DV = new DataView(U32.buffer);

/** Decode four little-endian bytes to seconds. */
export function decodeHytekTime(bytes: Uint8Array): number {
  if (bytes.length !== 4) {
    throw new RangeError(`expected 4 bytes, got ${bytes.length}`);
  }
  DV.setUint8(0, bytes[0]!);
  DV.setUint8(1, bytes[1]!);
  DV.setUint8(2, bytes[2]!);
  DV.setUint8(3, bytes[3]!);
  const h = DV.getUint32(0, true);
  const modExp = (h >>> 24) & 0xff;
  const significand = h & 0x7fffff;
  const realExp = (modExp - 2) & 0xff;
  const ieeeBits = (realExp << 23) | significand;
  DV.setUint32(0, ieeeBits, true);
  return F32[0]!;
}

/** Encode non-negative seconds to four little-endian bytes. */
export function encodeHytekTime(seconds: number): Uint8Array {
  if (seconds < 0 || Number.isNaN(seconds)) {
    throw new RangeError('time must be a non-negative finite number');
  }
  F32[0] = seconds;
  const ieee = DV.getUint32(0, true);
  const biasedExp = (ieee >>> 23) & 0xff;
  const significand = ieee & 0x7fffff;
  const h = (((biasedExp + 2) & 0xff) << 24) | significand;
  const out = new Uint8Array(4);
  new DataView(out.buffer).setUint32(0, h, true);
  return out;
}
