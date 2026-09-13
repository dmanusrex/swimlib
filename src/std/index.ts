// Hy-Tek .STD/.ST2 time standard files: fixed-width binary blocks.
export {
  parseStd,
  parseStdFile,
  StdParseError,
  type ParseStdResult,
  type ParseStdFileResult,
} from './parse';
export { buildStd, buildStdFile, buildHeader, buildStandardBlock, StdBuildError } from './build';
export {
  MAGIC,
  MAGIC_STR,
  ST2_BLOCK_SIZE,
  STD_BLOCK_SIZE,
  ST2_LABEL_COUNT,
  STD_LABEL_COUNT,
  TIME_KIND_ORDER,
  TIME_KINDS_PER_LABEL,
  HEADER_LAYOUT,
  STANDARD_LAYOUT,
  TYPE_INDIVIDUAL,
  TYPE_RELAY,
  blockSizeForFormat,
  labelCountForFormat,
  timeEntryCountForFormat,
  timeEntryOffset,
  timeEntryIndex,
  type StdFormat,
  type StdTimeKind,
  type LayoutField,
} from './layout';
export type { StdHeader, StdStandard, StdTimeMatrix } from './types';
