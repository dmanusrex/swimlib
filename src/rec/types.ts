import type { CalendarDate } from '../core/dates';
import { SET_NAME_LCM, SET_NAME_SCM, SET_NAME_SCY } from './layout';

export type RecCourseCode = 'L' | 'S' | 'Y';

/** First 120 bytes of a `.REC` file (logical view). */
export interface RecHeader {
  recordCount: number;
  generationDate: CalendarDate;
  /** Single ASCII course letter from file; typically L / S / Y. */
  courseCode: string;
  seasonTag: string;
  setName: string;
  softwareSignature: string;
}

export interface RecIndividualRecord {
  readonly typeFlag: 'I';
  eventCode: string;
  ageBand: string;
  seconds: number;
  recordDate: CalendarDate;
  lscCode: string;
  clubCode: string;
  /** If set when building, written verbatim for byte-identical round-trip. */
  rawTimeBytes?: Uint8Array;
  timeType: string;
  recordCentury: string;
  /** Exactly 9 bytes (often ASCII spaces). */
  trailingPad: Uint8Array;
  /** Full 80-char holder field from offsets 11..90. */
  holderRaw?: string;
  swimmerName: string;
  teamAffiliation: string;
  /** Exactly 34 bytes. */
  holderTail: Uint8Array;
}

export interface RecRelayRecord {
  readonly typeFlag: 'R';
  eventCode: string;
  ageBand: string;
  seconds: number;
  recordDate: CalendarDate;
  lscCode: string;
  clubCode: string;
  rawTimeBytes?: Uint8Array;
  timeType: string;
  recordCentury: string;
  trailingPad: Uint8Array;
  /** Full 80-char holder field from offsets 11..90. */
  holderRaw?: string;
  teamLabel: string;
  relayNames: string;
}

export type RecDataRecord = RecIndividualRecord | RecRelayRecord;

/** Default `setName` from `courseCode` when empty (L/S/Y only). */
export function defaultSetNameForCourse(courseCode: string): string {
  if (courseCode === 'L') return SET_NAME_LCM;
  if (courseCode === 'S') return SET_NAME_SCM;
  if (courseCode === 'Y') return SET_NAME_SCY;
  return '';
}
