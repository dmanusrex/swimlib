import { type SwimLibWarning } from '../core/errors';
import { decodeWindows1252 } from '../core/windows1252';
import { computeHy3Checksum } from './checksum';
import { RECORD_LENGTH } from './config';
import { HytekRecord } from './records/base';
import { CustomFieldsRecord } from './records/custom-fields';
import { DqDescriptionRecord } from './records/dq-description';
import { EmergencyContactRecord } from './records/emergency-contact';
import { FileDescription } from './records/file';
import { FillerRecord } from './records/filler';
import { GuardianNamesRecord } from './records/guardian-names';
import { GuardianPhonesRecord } from './records/guardian-phones';
import { IndividualEventRecord } from './records/individual-event';
import { IndividualInfoRecord } from './records/individual-info';
import { IndividualResultRecord } from './records/individual-result';
import { MedicalConditionRecord } from './records/medical-condition';
import { MedicationRecord } from './records/medication';
import { MeetRecord } from './records/meet';
import { MeetTypeRecord } from './records/meet-type';
import { MotherEmailRecord } from './records/mother-email';
import { RegistrationRecord } from './records/registration';
import { RelayNameRecord } from './records/relay-name';
import { RelayResultRecord } from './records/relay-result';
import { RelayTeamRecord } from './records/relay-team';
import { SecondaryContactAddressRecord } from './records/secondary-contact-address';
import { SecondaryContactPhoneRecord } from './records/secondary-contact-phone';
import { SplitRecord } from './records/split';
import { SwimmerAddressRecord } from './records/swimmer-address';
import { SwimmerContactRecord } from './records/swimmer-contact';
import { SwimmerPhoneRecord } from './records/swimmer-phone';
import { TeamRecord } from './records/team';
import { TeamAddressRecord } from './records/team-address';
import { TeamContactRecord } from './records/team-contact';
import { TeamStaffRecord } from './records/team-staff';

export { Hy3ParseError } from './records/base';
import { Hy3ParseError } from './records/base';

/**
 * Record type identifier to model class mapping. (Note: the split record's
 * identifier is 'G1' — the old library's example code mapped it under 'G0'.)
 *
 * B3 is a known record type but is NOT implemented: no authoritative
 * layout exists for it. 
 */
export const RECORD_TYPES = {
  A1: FileDescription,
  B1: MeetRecord,
  B2: MeetTypeRecord,
  C1: TeamRecord,
  C2: TeamAddressRecord,
  C3: TeamContactRecord,
  C6: TeamStaffRecord,
  D1: IndividualInfoRecord,
  D2: SwimmerAddressRecord,
  D3: SwimmerPhoneRecord,
  D4: SecondaryContactAddressRecord,
  D5: RegistrationRecord,
  D6: EmergencyContactRecord,
  D7: SecondaryContactPhoneRecord,
  D8: MedicalConditionRecord,
  D9: MedicationRecord,
  DA: CustomFieldsRecord,
  DB: GuardianNamesRecord,
  DC: FillerRecord,
  DD: GuardianPhonesRecord,
  DE: MotherEmailRecord,
  DF: SwimmerContactRecord,
  E1: IndividualEventRecord,
  E2: IndividualResultRecord,
  F1: RelayTeamRecord,
  F2: RelayResultRecord,
  F3: RelayNameRecord,
  G1: SplitRecord,
  H1: DqDescriptionRecord,
} as const;

export type Hy3RecordType = keyof typeof RECORD_TYPES;

export interface Hy3ParseOptions {
  /**
   * How to treat lines whose stored checksum does not match the recomputed
   * value: collect a warning (default), throw Hy3ParseError, or skip
   * verification entirely.
   */
  checksum?: 'error' | 'warn' | 'ignore';
}

/** A parsed HY3 file, grouped for convenient access. */
export interface Hy3File {
  /** All parsed records in file order. */
  records: HytekRecord[];
  /** Records grouped by type. */
  byType: {
    fileDescriptions: FileDescription[];
    meets: MeetRecord[];
    meetTypes: MeetTypeRecord[];
    teams: TeamRecord[];
    teamAddresses: TeamAddressRecord[];
    teamContacts: TeamContactRecord[];
    teamStaff: TeamStaffRecord[];
    individualInfos: IndividualInfoRecord[];
    swimmerAddresses: SwimmerAddressRecord[];
    swimmerPhones: SwimmerPhoneRecord[];
    secondaryContactAddresses: SecondaryContactAddressRecord[];
    registrations: RegistrationRecord[];
    emergencyContacts: EmergencyContactRecord[];
    secondaryContactPhones: SecondaryContactPhoneRecord[];
    medicalConditions: MedicalConditionRecord[];
    medications: MedicationRecord[];
    customFields: CustomFieldsRecord[];
    guardianNames: GuardianNamesRecord[];
    fillers: FillerRecord[];
    guardianPhones: GuardianPhonesRecord[];
    motherEmails: MotherEmailRecord[];
    swimmerContacts: SwimmerContactRecord[];
    individualEvents: IndividualEventRecord[];
    individualResults: IndividualResultRecord[];
    relayTeams: RelayTeamRecord[];
    relayResults: RelayResultRecord[];
    relayNames: RelayNameRecord[];
    splits: SplitRecord[];
    dqDescriptions: DqDescriptionRecord[];
  };
  warnings: SwimLibWarning[];
}

/**
 * Parse HY3 content into typed records.
 *
 * Accepts a string or Windows-1252 encoded bytes. Lines shorter than 130
 * characters are padded with spaces before processing. Unknown record types
 * are collected as warnings; checksum mismatches are handled according to
 * the `checksum` option (default 'warn').
 */
export function parseHy3(input: string | Uint8Array, options: Hy3ParseOptions = {}): Hy3File {
  const content = typeof input === 'string' ? input : decodeWindows1252(input);
  const checksumMode = options.checksum ?? 'warn';

  const file: Hy3File = {
    records: [],
    byType: {
      fileDescriptions: [],
      meets: [],
      meetTypes: [],
      teams: [],
      teamAddresses: [],
      teamContacts: [],
      teamStaff: [],
      individualInfos: [],
      swimmerAddresses: [],
      swimmerPhones: [],
      secondaryContactAddresses: [],
      registrations: [],
      emergencyContacts: [],
      secondaryContactPhones: [],
      medicalConditions: [],
      medications: [],
      customFields: [],
      guardianNames: [],
      fillers: [],
      guardianPhones: [],
      motherEmails: [],
      swimmerContacts: [],
      individualEvents: [],
      individualResults: [],
      relayTeams: [],
      relayResults: [],
      relayNames: [],
      splits: [],
      dqDescriptions: [],
    },
    warnings: [],
  };

  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]!;
    if (raw.trim() === '') continue;

    const lineNo = i + 1;
    const line = raw.length < RECORD_LENGTH ? raw.padEnd(RECORD_LENGTH, ' ') : raw;

    if (checksumMode !== 'ignore') {
      const stored = line.substring(RECORD_LENGTH - 2, RECORD_LENGTH);
      const computed = computeHy3Checksum(line);
      if (stored !== computed) {
        const message = `checksum mismatch: stored ${JSON.stringify(stored)}, computed ${JSON.stringify(computed)}`;
        if (checksumMode === 'error') {
          throw new Hy3ParseError(`line ${lineNo}: ${message}`);
        }
        file.warnings.push({ code: 'checksum-mismatch', message, line: lineNo });
      }
    }

    const type = line.substring(0, 2) as Hy3RecordType;
    const Model = RECORD_TYPES[type];
    if (!Model) {
      file.warnings.push({
        code: 'unknown-record-type',
        message: `unknown record type ${JSON.stringify(line.substring(0, 2))}`,
        line: lineNo,
      });
      continue;
    }

    const record = (Model as unknown as { fromRecord(record: string): HytekRecord }).fromRecord(
      line,
    );

    file.records.push(record);
    if (record instanceof FileDescription) file.byType.fileDescriptions.push(record);
    else if (record instanceof MeetRecord) file.byType.meets.push(record);
    else if (record instanceof MeetTypeRecord) file.byType.meetTypes.push(record);
    else if (record instanceof TeamRecord) file.byType.teams.push(record);
    else if (record instanceof TeamAddressRecord) file.byType.teamAddresses.push(record);
    else if (record instanceof TeamContactRecord) file.byType.teamContacts.push(record);
    else if (record instanceof TeamStaffRecord) file.byType.teamStaff.push(record);
    else if (record instanceof IndividualInfoRecord) file.byType.individualInfos.push(record);
    else if (record instanceof SwimmerAddressRecord) file.byType.swimmerAddresses.push(record);
    else if (record instanceof SwimmerPhoneRecord) file.byType.swimmerPhones.push(record);
    else if (record instanceof SecondaryContactAddressRecord)
      file.byType.secondaryContactAddresses.push(record);
    else if (record instanceof RegistrationRecord) file.byType.registrations.push(record);
    else if (record instanceof EmergencyContactRecord) file.byType.emergencyContacts.push(record);
    else if (record instanceof SecondaryContactPhoneRecord)
      file.byType.secondaryContactPhones.push(record);
    else if (record instanceof MedicalConditionRecord) file.byType.medicalConditions.push(record);
    else if (record instanceof MedicationRecord) file.byType.medications.push(record);
    else if (record instanceof CustomFieldsRecord) file.byType.customFields.push(record);
    else if (record instanceof GuardianNamesRecord) file.byType.guardianNames.push(record);
    else if (record instanceof FillerRecord) file.byType.fillers.push(record);
    else if (record instanceof GuardianPhonesRecord) file.byType.guardianPhones.push(record);
    else if (record instanceof MotherEmailRecord) file.byType.motherEmails.push(record);
    else if (record instanceof SwimmerContactRecord) file.byType.swimmerContacts.push(record);
    else if (record instanceof IndividualEventRecord) file.byType.individualEvents.push(record);
    else if (record instanceof IndividualResultRecord) file.byType.individualResults.push(record);
    else if (record instanceof RelayTeamRecord) file.byType.relayTeams.push(record);
    else if (record instanceof RelayResultRecord) file.byType.relayResults.push(record);
    else if (record instanceof RelayNameRecord) file.byType.relayNames.push(record);
    else if (record instanceof SplitRecord) file.byType.splits.push(record);
    else if (record instanceof DqDescriptionRecord) file.byType.dqDescriptions.push(record);
  }

  if (file.records.length === 0) {
    throw new Hy3ParseError('no HY3 records found in input');
  }

  return file;
}
