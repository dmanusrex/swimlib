// Hy-Tek .REC record files: 120-byte fixed-width binary frames.
export { parseRec, RecParseError, type ParseRecResult } from './parse';
export { buildRec, buildHeader, buildDataRecord, RecBuildError } from './build';
export {
  RECORD_SIZE,
  MAGIC,
  MAGIC_STR,
  HEADER_FIELDS,
  DATA_FIELDS,
  HOLDER,
  TYPE_INDIVIDUAL,
  TYPE_RELAY,
  DEFAULT_SEASON_TAG,
  DEFAULT_LSC_CODE,
  DEFAULT_SOFTWARE_SIGNATURE,
  DEFAULT_TIME_TYPE,
  DEFAULT_RECORD_CENTURY,
  SET_NAME_LCM,
  SET_NAME_SCM,
  SET_NAME_SCY,
  type LayoutField,
} from './layout';
export type {
  RecCourseCode,
  RecHeader,
  RecDataRecord,
  RecIndividualRecord,
  RecRelayRecord,
} from './types';
export { defaultSetNameForCourse } from './types';
// Continuity aliases for the pre-SwimLib library.
export {
  decodeHytekTime as decodeTime,
  encodeHytekTime as encodeTime,
} from '../core/hytek-timecodec';
