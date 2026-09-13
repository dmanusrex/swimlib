import { SwimLibParseError, type SwimLibWarning } from '../core/errors';
import { decodeWindows1252 } from '../core/windows1252';
import { type ValidationOptions } from './fields';
import { SdifRecord } from './records/base';
import { FileDescription } from './records/file';
import { IndividualEventRecord } from './records/individual';
import { IndividualAdminRecord } from './records/individual-admin';
import { IndividualContactRecord } from './records/individual-contact';
import { IndividualInfoRecord } from './records/individual-info';
import { MeetRecord } from './records/meet';
import { MeetHostRecord } from './records/meet-host';
import { RelayEventRecord } from './records/relay-event';
import { RelayNameRecord } from './records/relay-name';
import { SplitRecord } from './records/split';
import { TeamRecord } from './records/team';
import { TeamEntryRecord } from './records/team-entry';
import { FileTerminatorRecord } from './records/terminator';

export { SdifParseError } from './records/base';
import { SdifParseError } from './records/base';

/** Record type identifier to model class mapping. */
export const RECORD_TYPES = {
  A0: FileDescription,
  B1: MeetRecord,
  B2: MeetHostRecord,
  C1: TeamRecord,
  C2: TeamEntryRecord,
  D0: IndividualEventRecord,
  D1: IndividualAdminRecord,
  D2: IndividualContactRecord,
  D3: IndividualInfoRecord,
  E0: RelayEventRecord,
  F0: RelayNameRecord,
  G0: SplitRecord,
  Z0: FileTerminatorRecord,
} as const;

export type SdifRecordType = keyof typeof RECORD_TYPES;

export interface SdifParseOptions extends ValidationOptions {
  /**
   * When true, validation errors and unknown record types throw
   * SdifParseError instead of being collected as warnings.
   */
  strict?: boolean;
}

/** A parsed SDIF file, grouped for convenient access. */
export interface SdifFile {
  /** All parsed records in file order. */
  records: SdifRecord[];
  /** Records grouped by type. */
  byType: {
    fileDescriptions: FileDescription[];
    meets: MeetRecord[];
    meetHosts: MeetHostRecord[];
    teams: TeamRecord[];
    teamEntries: TeamEntryRecord[];
    individualEvents: IndividualEventRecord[];
    individualAdmins: IndividualAdminRecord[];
    individualContacts: IndividualContactRecord[];
    individualInfos: IndividualInfoRecord[];
    relayEvents: RelayEventRecord[];
    relayNames: RelayNameRecord[];
    splits: SplitRecord[];
    terminators: FileTerminatorRecord[];
  };
  warnings: SwimLibWarning[];
}

/**
 * Parse SD3/CL2 content into typed records.
 *
 * Accepts a string or Windows-1252 encoded bytes. Unknown record types and
 * per-record validation failures are collected as warnings unless
 * `strict: true`.
 */
export function parseSdif(input: string | Uint8Array, options: SdifParseOptions = {}): SdifFile {
  const content = typeof input === 'string' ? input : decodeWindows1252(input);

  const file: SdifFile = {
    records: [],
    byType: {
      fileDescriptions: [],
      meets: [],
      meetHosts: [],
      teams: [],
      teamEntries: [],
      individualEvents: [],
      individualAdmins: [],
      individualContacts: [],
      individualInfos: [],
      relayEvents: [],
      relayNames: [],
      splits: [],
      terminators: [],
    },
    warnings: [],
  };

  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    if (line.trim() === '') continue;

    const lineNo = i + 1;
    const type = line.substring(0, 2) as SdifRecordType;
    const Model = RECORD_TYPES[type];
    if (!Model) {
      if (options.strict) {
        throw new SdifParseError(`line ${lineNo}: unknown record type ${JSON.stringify(type)}`);
      }
      file.warnings.push({
        code: 'unknown-record-type',
        message: `unknown record type ${JSON.stringify(line.substring(0, 2))}`,
        line: lineNo,
      });
      continue;
    }

    const record = (Model as unknown as { fromRecord(record: string): SdifRecord }).fromRecord(
      line,
    );
    const result = record.validate(options);
    if (!result.isValid) {
      const detail = result.errors.map((e) => e.message).join('; ');
      if (options.strict) {
        throw new SdifParseError(`line ${lineNo}: ${detail}`);
      }
      file.warnings.push({
        code: 'validation-error',
        message: `${record.identifier} record failed validation: ${detail}`,
        line: lineNo,
      });
    }
    if (result.warnings.length > 0) {
      file.warnings.push({
        code: 'validation-warning',
        message: `${record.identifier} record: ${result.warnings.map((w) => w.message).join('; ')}`,
        line: lineNo,
      });
    }

    file.records.push(record);
    if (record instanceof FileDescription) file.byType.fileDescriptions.push(record);
    else if (record instanceof MeetRecord) file.byType.meets.push(record);
    else if (record instanceof MeetHostRecord) file.byType.meetHosts.push(record);
    else if (record instanceof TeamRecord) file.byType.teams.push(record);
    else if (record instanceof TeamEntryRecord) file.byType.teamEntries.push(record);
    else if (record instanceof IndividualEventRecord) file.byType.individualEvents.push(record);
    else if (record instanceof IndividualAdminRecord) file.byType.individualAdmins.push(record);
    else if (record instanceof IndividualContactRecord) file.byType.individualContacts.push(record);
    else if (record instanceof IndividualInfoRecord) file.byType.individualInfos.push(record);
    else if (record instanceof RelayEventRecord) file.byType.relayEvents.push(record);
    else if (record instanceof RelayNameRecord) file.byType.relayNames.push(record);
    else if (record instanceof SplitRecord) file.byType.splits.push(record);
    else if (record instanceof FileTerminatorRecord) file.byType.terminators.push(record);
  }

  if (file.records.length === 0) {
    throw new SwimLibParseError('no SDIF records found in input');
  }

  return file;
}

/**
 * Parse a Hy-Tek CL2 file (the precursor to SD3). Equivalent to
 * `parseSdif(input, { cl2: true })` — CL2 files predate SDIF v3 and may
 * omit fields at either mandatory level (M1 and M2), so both checks are
 * turned off.
 */
export function parseCl2(
  input: string | Uint8Array,
  options: Omit<SdifParseOptions, 'cl2'> = {},
): SdifFile {
  return parseSdif(input, { ...options, cl2: true });
}
