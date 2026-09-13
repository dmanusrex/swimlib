// SDIF (SD3) files: 160-character fixed-width records. CL2 files (the
// Hy-Tek precursor) are readable via parseCl2 / the cl2 option.
export {
  parseSdif,
  parseCl2,
  SdifParseError,
  RECORD_TYPES,
  type SdifFile,
  type SdifParseOptions,
  type SdifRecordType,
} from './parse';
export { buildSdif, SdifBuildError, type SdifBuildOptions } from './build';
export { RECORD_LENGTH, RECORD_SEP, FIELD_PADDING } from './config';
export {
  FieldType,
  FieldRequirement,
  ErrorSeverity,
  type FieldDefinition,
  type FieldError,
  type ValidationOptions,
  type ValidationResult,
} from './fields';
export * from './codes';
export { SdifRecord, validateField, type SdifModel } from './records/base';
export { FileDescription } from './records/file';
export { MeetRecord } from './records/meet';
export { MeetHostRecord } from './records/meet-host';
export { TeamRecord } from './records/team';
export { TeamEntryRecord } from './records/team-entry';
export { IndividualEventRecord } from './records/individual';
export { IndividualAdminRecord } from './records/individual-admin';
export { IndividualContactRecord } from './records/individual-contact';
export { IndividualInfoRecord } from './records/individual-info';
export { RelayEventRecord } from './records/relay-event';
export { RelayNameRecord } from './records/relay-name';
export { SplitRecord } from './records/split';
export { FileTerminatorRecord } from './records/terminator';
export { SwimTime } from '../core/swimtime';
