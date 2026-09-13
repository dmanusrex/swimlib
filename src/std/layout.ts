/** Byte layout for Hy-Tek `.ST2` / `.STD` time standard files. */

export const MAGIC_STR = 'STD';

/** ASCII bytes for `STD`. */
export const MAGIC = new Uint8Array([0x53, 0x54, 0x44]);

export const ST2_BLOCK_SIZE = 320;
export const STD_BLOCK_SIZE = 260;

export const ST2_LABEL_COUNT = 12;
export const STD_LABEL_COUNT = 8;

export const TIME_KINDS_PER_LABEL = 6;
export const ST2_TIME_ENTRY_COUNT = ST2_LABEL_COUNT * TIME_KINDS_PER_LABEL;
export const STD_TIME_ENTRY_COUNT = STD_LABEL_COUNT * TIME_KINDS_PER_LABEL;

/** Logical time slots in STD file (extra float slots are padding). */
export const STD_TIME_SLOT_COUNT = 60;

export type StdFormat = 'st2' | 'std';

export function blockSizeForFormat(format: StdFormat): number {
  return format === 'st2' ? ST2_BLOCK_SIZE : STD_BLOCK_SIZE;
}

export function labelCountForFormat(format: StdFormat): number {
  return format === 'st2' ? ST2_LABEL_COUNT : STD_LABEL_COUNT;
}

export function timeEntryCountForFormat(format: StdFormat): number {
  return format === 'st2' ? ST2_TIME_ENTRY_COUNT : STD_TIME_ENTRY_COUNT;
}

export const TIME_KIND_ORDER = ['scmDqt', 'lcmDqt', 'scyDqt', 'scmQt', 'lcmQt', 'scyQt'] as const;

export type StdTimeKind = (typeof TIME_KIND_ORDER)[number];

export interface LayoutField {
  readonly name: string;
  readonly offset: number;
  readonly length: number;
}

const HEADER_PREFIX: readonly LayoutField[] = [
  { name: 'magic', offset: 0, length: 3 },
  { name: 'standardBlockCount', offset: 3, length: 4 },
  { name: 'createdDate', offset: 7, length: 6 },
  { name: 'padAfterDate', offset: 13, length: 7 },
];

const LABELS_OFFSET = 20;
const LABELS_ST2_LENGTH = 48;
const LABELS_STD_LENGTH = 32;
const STD_PAD_AFTER_LABELS_OFFSET = 52;
const STD_PAD_AFTER_LABELS_LENGTH = 8;
const YEAR_SLOT_LENGTH = 4;
const YEAR_PAD_LENGTH = 16;
const YEAR_SLOT_STRIDE = YEAR_SLOT_LENGTH + YEAR_PAD_LENGTH;

const ST2_FIRST_YEAR_OFFSET = 68;
const STD_FIRST_YEAR_OFFSET = 60;
const ST2_YEAR_SLOT_COUNT = 12;
const STD_YEAR_SLOT_COUNT = 8;
const ST2_HEADER_TRAILING_PAD_OFFSET = 308;
const ST2_HEADER_TRAILING_PAD_LENGTH = 12;
const STD_HEADER_TRAILING_PAD_OFFSET = 220;
const STD_HEADER_TRAILING_PAD_LENGTH = 40;

export const HEADER_LAYOUT = {
  st2: {
    blockSize: ST2_BLOCK_SIZE,
    labelCount: ST2_LABEL_COUNT,
    labels: { offset: LABELS_OFFSET, length: LABELS_ST2_LENGTH },
    padAfterLabels: null as { offset: number; length: number } | null,
    firstYearOffset: ST2_FIRST_YEAR_OFFSET,
    yearSlotCount: ST2_YEAR_SLOT_COUNT,
    yearSlotStride: YEAR_SLOT_STRIDE,
    yearId: { length: YEAR_SLOT_LENGTH },
    yearPad: { length: YEAR_PAD_LENGTH },
    trailingPad: {
      offset: ST2_HEADER_TRAILING_PAD_OFFSET,
      length: ST2_HEADER_TRAILING_PAD_LENGTH,
    },
  },
  std: {
    blockSize: STD_BLOCK_SIZE,
    labelCount: STD_LABEL_COUNT,
    labels: { offset: LABELS_OFFSET, length: LABELS_STD_LENGTH },
    padAfterLabels: { offset: STD_PAD_AFTER_LABELS_OFFSET, length: STD_PAD_AFTER_LABELS_LENGTH },
    firstYearOffset: STD_FIRST_YEAR_OFFSET,
    yearSlotCount: STD_YEAR_SLOT_COUNT,
    yearSlotStride: YEAR_SLOT_STRIDE,
    yearId: { length: YEAR_SLOT_LENGTH },
    yearPad: { length: YEAR_PAD_LENGTH },
    trailingPad: {
      offset: STD_HEADER_TRAILING_PAD_OFFSET,
      length: STD_HEADER_TRAILING_PAD_LENGTH,
    },
  },
} as const;

const STANDARD_PREFIX: readonly LayoutField[] = [
  { name: 'gender', offset: 0, length: 1 },
  { name: 'stroke', offset: 1, length: 1 },
  { name: 'distance', offset: 2, length: 4 },
  { name: 'lowerAge', offset: 6, length: 2 },
  { name: 'upperAge', offset: 8, length: 2 },
  { name: 'typeFlag', offset: 10, length: 1 },
  { name: 'padBeforeTimes', offset: 11, length: 9 },
];

export const STANDARD_LAYOUT = {
  st2: {
    blockSize: ST2_BLOCK_SIZE,
    times: { offset: 20, length: 288 },
    trailingPad: { offset: 308, length: 12 } as { offset: number; length: number } | null,
    timeEntryCount: ST2_TIME_ENTRY_COUNT,
  },
  std: {
    blockSize: STD_BLOCK_SIZE,
    times: { offset: 20, length: 240 },
    trailingPad: null as { offset: number; length: number } | null,
    timeEntryCount: STD_TIME_ENTRY_COUNT,
    timeSlotCount: STD_TIME_SLOT_COUNT,
  },
} as const;

export const HEADER_PREFIX_FIELDS = HEADER_PREFIX;
export const STANDARD_PREFIX_FIELDS = STANDARD_PREFIX;

type HeaderPrefixFieldName = 'standardBlockCount' | 'createdDate';

export function getHeaderPrefixField(name: HeaderPrefixFieldName): LayoutField {
  const field = HEADER_PREFIX_FIELDS.find((f) => f.name === name);
  if (field === undefined) {
    throw new Error(`header prefix field not found: ${name}`);
  }
  return field;
}

export function getStandardPrefixField(name: string): LayoutField {
  const field = STANDARD_PREFIX_FIELDS.find((f) => f.name === name);
  if (field === undefined) {
    throw new Error(`standard prefix field not found: ${name}`);
  }
  return field;
}

export const TYPE_INDIVIDUAL = 'I';
export const TYPE_RELAY = 'R';

function assertHeaderSize(format: StdFormat): void {
  const h = HEADER_LAYOUT[format];
  const end = h.trailingPad.offset + h.trailingPad.length;
  if (end !== h.blockSize) {
    throw new Error(`${format} header layout ends at ${end}, expected ${h.blockSize}`);
  }
}

function assertStandardSize(format: StdFormat): void {
  const s = STANDARD_LAYOUT[format];
  let end = s.times.offset + s.times.length;
  if (s.trailingPad) {
    end = s.trailingPad.offset + s.trailingPad.length;
  }
  if (end !== s.blockSize) {
    throw new Error(`${format} standard layout ends at ${end}, expected ${s.blockSize}`);
  }
}

assertHeaderSize('st2');
assertHeaderSize('std');
assertStandardSize('st2');
assertStandardSize('std');

/**
 * Byte offset within the times region for `kindIndex` (0..5) and `labelIndex`.
 * File order is kind-major: all labels for SCM-DQT, then all for LCM-DQT, etc.
 */
export function timeEntryOffset(kindIndex: number, labelIndex: number, labelCount: number): number {
  return (kindIndex * labelCount + labelIndex) * 4;
}

/** Linear entry index for kind-major layout. */
export function timeEntryIndex(kindIndex: number, labelIndex: number, labelCount: number): number {
  return kindIndex * labelCount + labelIndex;
}
