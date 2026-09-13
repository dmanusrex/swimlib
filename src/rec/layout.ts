/** Byte layout for Hy-Tek `.REC` (120-byte frames). */

export const RECORD_SIZE = 120;

export const MAGIC_STR = 'REC';

/** ASCII bytes for `REC`. */
export const MAGIC = new Uint8Array([0x52, 0x45, 0x43]);

export interface LayoutField {
  readonly name: string;
  readonly offset: number;
  readonly length: number;
}

export const HEADER_FIELDS = [
  { name: 'magic', offset: 0, length: 3 },
  { name: 'spaceAfterMagic', offset: 3, length: 1 },
  { name: 'recordCount', offset: 4, length: 3 },
  { name: 'generationDate', offset: 7, length: 6 },
  { name: 'spaceAfterDate', offset: 13, length: 1 },
  { name: 'courseCode', offset: 14, length: 1 },
  { name: 'seasonTag', offset: 15, length: 4 },
  { name: 'setName', offset: 19, length: 18 },
  { name: 'softwareSignature', offset: 37, length: 13 },
  { name: 'trailingPad', offset: 50, length: 70 },
] as const satisfies readonly LayoutField[];

export const DATA_FIELDS = [
  { name: 'eventCode', offset: 0, length: 6 },
  { name: 'ageBand', offset: 6, length: 4 },
  { name: 'typeFlag', offset: 10, length: 1 },
  { name: 'holder', offset: 11, length: 80 },
  { name: 'date', offset: 91, length: 6 },
  { name: 'timeBytes', offset: 97, length: 4 },
  { name: 'lscCode', offset: 101, length: 2 },
  { name: 'clubCode', offset: 103, length: 5 },
  { name: 'timeType', offset: 108, length: 1 },
  { name: 'recordCentury', offset: 109, length: 2 },
  { name: 'trailingPad', offset: 111, length: 9 },
] as const satisfies readonly LayoutField[];

/** Sub-ranges within the 80-byte holder blob (offsets relative to holder start). */
export const HOLDER = {
  individualName: { start: 0, length: 30 },
  individualTeam: { start: 30, length: 16 },
  individualTail: { start: 46, length: 34 },
  relayTeam: { start: 0, length: 30 },
  relayNames: { start: 30, length: 50 },
} as const;

export const TYPE_INDIVIDUAL = 'I';
export const TYPE_RELAY = 'R';

export const DEFAULT_SEASON_TAG = '2020';
export const DEFAULT_LSC_CODE = '  ';
export const DEFAULT_SOFTWARE_SIGNATURE = 'WIN-TM028.0Fd';
export const DEFAULT_TIME_TYPE = 'A';
export const DEFAULT_RECORD_CENTURY = '20';

export const SET_NAME_LCM = 'Rec_LC';
export const SET_NAME_SCM = 'Rec_SC';
export const SET_NAME_SCY = 'Rec_SCY';

function assertContiguous(fields: readonly LayoutField[], total: number): void {
  let cursor = 0;
  for (const f of fields) {
    if (f.offset !== cursor) {
      throw new Error(`layout gap at ${f.name}: expected ${cursor}, got ${f.offset}`);
    }
    cursor = f.offset + f.length;
  }
  if (cursor !== total) {
    throw new Error(`layout total ${cursor} != ${total}`);
  }
}

assertContiguous(HEADER_FIELDS, RECORD_SIZE);
assertContiguous(DATA_FIELDS, RECORD_SIZE);
