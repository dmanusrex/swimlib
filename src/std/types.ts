import type { CalendarDate } from '../core/dates';
import type { StdTimeKind } from './layout';

/** First block of a `.ST2` / `.STD` file (logical view). */
export interface StdHeader {
  /** Total frames in file including this header (authoritative on parse). */
  standardBlockCount: number;
  createdDate: CalendarDate;
  labels: string[];
  yearIds: string[];
  /** Exactly 12 (ST2) or 40 (STD) space bytes when round-tripping. */
  headerTrailingPad?: Uint8Array;
}

export type StdTimeMatrix = Record<StdTimeKind, number[]>;

export interface StdStandard {
  gender: string;
  stroke: string;
  distance: string;
  lowerAge: string;
  upperAge: string;
  typeFlag: 'I' | 'R';
  times: StdTimeMatrix;
  /** Full times region for byte-identical STD/ST2 round-trip when padding matters. */
  timesRegionRaw?: Uint8Array;
  /** 12 bytes (ST2 only) for byte-identical round-trip. */
  blockTrailingPad?: Uint8Array;
}
