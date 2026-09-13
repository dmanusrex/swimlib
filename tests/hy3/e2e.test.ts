import { describe, expect, it } from 'vitest';
import { SwimTime } from '../../src/core/swimtime';
import {
  buildHy3,
  computeHy3Checksum,
  CustomFieldsRecord,
  EmergencyContactRecord,
  FileCode,
  FileDescription,
  FillerRecord,
  GuardianNamesRecord,
  GuardianPhonesRecord,
  Hy3BuildError,
  Hy3ParseError,
  IndividualEventRecord,
  IndividualInfoRecord,
  MedicalConditionRecord,
  MedicationRecord,
  MeetRecord,
  MeetTypeRecord,
  MotherEmailRecord,
  parseHy3,
  RECORD_LENGTH,
  RegistrationRecord,
  RelayNameRecord,
  RelayTeamRecord,
  ResultTypeCode,
  SecondaryContactAddressRecord,
  SecondaryContactPhoneRecord,
  SexCode,
  SplitRecord,
  StrokeCode,
  SwimmerAddressRecord,
  SwimmerContactRecord,
  SwimmerPhoneRecord,
  TeamAddressRecord,
  TeamContactRecord,
  TeamRecord,
} from '../../src/hy3/index';

/**
 * Build a small synthetic meet-entries file used across the e2e tests.
 * A1 → B1 → B2 → C1 → C2 → C3 → per swimmer D1..DF → E1s → F1 + F3.
 */
function syntheticRecords() {
  return [
    new FileDescription({
      fileCode: FileCode.MEET_ENTRIES,
      fileDescription: 'Meet Entries',
      softwareVendor: 'SwimLib Project',
      softwareName: 'SwimLib 0.0.0',
      creationDate: new Date(Date.UTC(2026, 6, 1)),
      creationTime: '09:15 AM',
      licensee: 'Etobicoke Swim Club',
    }),
    new MeetRecord({
      meetName: 'SwimLib Invitational',
      meetFacility: 'Test Aquatic Centre',
      meetStartDate: new Date(Date.UTC(2026, 6, 10)),
      meetEndDate: new Date(Date.UTC(2026, 6, 12)),
      ageUpDate: new Date(Date.UTC(2026, 6, 10)),
    }),
    new MeetTypeRecord({
      meetType: 'AG',
      courseCode1: 'Y',
      courseCode2: 'Y',
    }),
    new TeamRecord({
      teamCode: 'ESWIM',
      name: 'Etobicoke Swimming',
      abbreviation: 'ESWIM',
      lsc: 'ON',
      teamType: 'AGE',
    }),
    new TeamAddressRecord({
      mailTo: 'Jane Coach',
      address: '123 Pool Lane',
      city: 'Toronto',
      state: 'ON',
      postalCode: '90210',
      country: 'CAN',
      teamRegistration: 'OTH',
    }),
    new TeamContactRecord({
      daytimePhone: '416-555-1234',
      eveningPhone: '416-555-5678',
      email: 'coach@example.com',
    }),
    new IndividualInfoRecord({
      swimmerGender: SexCode.FEMALE,
      swimmerId: '769',
      swimmerLastName: 'Azbill',
      swimmerFirstName: 'Millicent',
      swimmerMiddleInitial: 'C',
      swimmerBirthDate: new Date(Date.UTC(2014, 0, 21)),
      swimmerAge: 12,
    }),
    new SwimmerAddressRecord({
      address1: '123 Pool Lane',
      city: 'Toronto',
      state: 'ON',
      postalCode: 'M9B 1B1',
      country: 'CAN',
    }),
    new SwimmerPhoneRecord({
      phone1: '416-555-1111',
      phone2: '416-555-2222',
      email: 'father@example.com',
    }),
    new SecondaryContactAddressRecord({
      mailTo: 'Pat Guardian',
      address1: '99 Deck Street',
      city: 'Etobicoke',
      state: 'ON',
      postalCode: 'M8V 2W2',
      country: 'CAN',
    }),
    new RegistrationRecord({
      primaryMailTo: 'Jane Parent',
      registrationDate: '2026',
    }),
    new EmergencyContactRecord({
      doctorName: 'Dr Emma Waters',
      doctorPhone: '416-555-4444',
      emergencyName: 'Uncle Bob',
      emergencyPhone: '416-555-5555',
    }),
    new SecondaryContactPhoneRecord({
      parent1OfficePhone: '416-555-6666',
      homePhone: '416-555-7777',
      parent1Email: 'secondary@example.com',
    }),
    new MedicalConditionRecord({ description: 'Mild asthma - carries inhaler' }),
    new MedicationRecord({ description: 'Salbutamol as needed' }),
    new CustomFieldsRecord({
      field1Name: 'Squad',
      field1Value: 'Senior',
    }),
    new GuardianNamesRecord({
      fatherLastName: 'Azbill',
      fatherFirstName: 'Frank',
      motherFirstName: 'Mary',
    }),
    new FillerRecord(),
    new GuardianPhonesRecord({
      fatherCellPhone: '416-555-0001',
      motherCellPhone: '416-555-0003',
    }),
    new MotherEmailRecord({
      motherEmail: 'mother@example.com',
      motherLastName: 'Azbill',
    }),
    new SwimmerContactRecord({
      middleName: 'Catherine',
      cellPhone: '416-555-9999',
      email: 'swimmer@example.com',
    }),
    new IndividualEventRecord({
      swimmerGender: SexCode.FEMALE,
      swimmerId: '769',
      swimmerAbbr: 'AZBIL',
      gender1: SexCode.FEMALE,
      gender2: SexCode.GIRLS,
      distance: '100',
      stroke: StrokeCode.FREESTYLE,
      ageLower: '11',
      ageUpper: '12',
      eventFee: '3.50',
      eventNumber: '202',
      seedTime1: SwimTime.fromString('1:21.24'),
      seedCourse1: 'Y',
    }),
    new RelayTeamRecord({
      teamAbbr: 'ESWIM',
      relayTeam: 'A',
      relayGender: 'F',
      relayGender1: 'F',
      relayGender2: 'G',
      relayDistance: 200,
      stroke: StrokeCode.FREESTYLE,
      ageLower: '11',
      ageUpper: '12',
      eventFee: '12.00',
      eventNumber: '255',
      seedTime1: SwimTime.fromString('2:26.99'),
      seedCourse1: 'Y',
    }),
    new RelayNameRecord({
      swimmer1Gender: SexCode.FEMALE,
      swimmer1Id: '769',
      swimmer1Abbr: 'AZBIL',
      swimmer1Gender2: SexCode.GIRLS,
      swimmer1RelayLeg: 1,
      swimmer2Gender: SexCode.FEMALE,
      swimmer2Id: '770',
      swimmer2Abbr: 'SMITH',
      swimmer2Gender2: SexCode.GIRLS,
      swimmer2RelayLeg: 2,
      swimmer3Gender: SexCode.FEMALE,
      swimmer3Id: '771',
      swimmer3Abbr: 'JONES',
      swimmer3Gender2: SexCode.GIRLS,
      swimmer3RelayLeg: 3,
      swimmer4Gender: SexCode.FEMALE,
      swimmer4Id: '772',
      swimmer4Abbr: 'WONG*',
      swimmer4Gender2: SexCode.GIRLS,
      swimmer4RelayLeg: 4,
    }),
    new SplitRecord({
      splitResultType1: ResultTypeCode.FINAL,
      splitLength1: 2,
      splitTime1: SwimTime.fromString('29.13'),
      splitResultType2: ResultTypeCode.FINAL,
      splitLength2: 4,
      splitTime2: SwimTime.fromString('1:01.05'),
    }),
  ];
}

describe('hy3 end-to-end', () => {
  it('builds a file with 130-char lines, each ending in a valid checksum', () => {
    const content = buildHy3(syntheticRecords());
    expect(content.endsWith('\r\n')).toBe(true);
    const lines = content.split('\r\n').filter((l) => l !== '');
    expect(lines.length).toBe(25);
    for (const line of lines) {
      expect(line.length).toBe(RECORD_LENGTH);
      expect(line.substring(128, 130)).toBe(computeHy3Checksum(line));
    }
  });

  it('parses back with zero warnings and correct byType groupings', () => {
    const parsed = parseHy3(buildHy3(syntheticRecords()));
    expect(parsed.warnings).toEqual([]);
    expect(parsed.records.length).toBe(25);
    expect(parsed.byType.fileDescriptions.length).toBe(1);
    expect(parsed.byType.meets.length).toBe(1);
    expect(parsed.byType.meetTypes.length).toBe(1);
    expect(parsed.byType.teams.length).toBe(1);
    expect(parsed.byType.teamAddresses.length).toBe(1);
    expect(parsed.byType.teamContacts.length).toBe(1);
    expect(parsed.byType.individualInfos.length).toBe(1);
    expect(parsed.byType.swimmerAddresses.length).toBe(1);
    expect(parsed.byType.swimmerPhones.length).toBe(1);
    expect(parsed.byType.secondaryContactAddresses.length).toBe(1);
    expect(parsed.byType.registrations.length).toBe(1);
    expect(parsed.byType.emergencyContacts.length).toBe(1);
    expect(parsed.byType.secondaryContactPhones.length).toBe(1);
    expect(parsed.byType.medicalConditions.length).toBe(1);
    expect(parsed.byType.medications.length).toBe(1);
    expect(parsed.byType.customFields.length).toBe(1);
    expect(parsed.byType.guardianNames.length).toBe(1);
    expect(parsed.byType.fillers.length).toBe(1);
    expect(parsed.byType.guardianPhones.length).toBe(1);
    expect(parsed.byType.motherEmails.length).toBe(1);
    expect(parsed.byType.swimmerContacts.length).toBe(1);
    expect(parsed.byType.individualEvents.length).toBe(1);
    expect(parsed.byType.relayTeams.length).toBe(1);
    expect(parsed.byType.relayNames.length).toBe(1);
    expect(parsed.byType.splits.length).toBe(1);

    expect(parsed.byType.meets[0]!.meetName).toBe('SwimLib Invitational');
    expect(parsed.byType.meetTypes[0]!.meetType).toBe('AG');
    expect(parsed.byType.registrations[0]!.literalX).toBe('X');
    expect(parsed.byType.individualEvents[0]!.seedTime1!.getHundredths()).toBe(8124);
    expect(parsed.byType.relayTeams[0]!.relayDistance).toBe(200);
  });

  it('round-trips build → parse → build to byte-identical content', () => {
    const content = buildHy3(syntheticRecords());
    const rebuilt = buildHy3(parseHy3(content));
    expect(rebuilt).toBe(content);
  });

  it('accepts Windows-1252 bytes as input', () => {
    const content = buildHy3(syntheticRecords());
    const bytes = new Uint8Array([...content].map((c) => c.charCodeAt(0)));
    const parsed = parseHy3(bytes);
    expect(parsed.byType.teams[0]!.teamCode).toBe('ESWIM');
  });

  it('handles checksum corruption per the checksum option', () => {
    // 'I' → 'i' changes the weighted sum by ≥ 32 > 21, guaranteeing the
    // recomputed checksum differs from the stored one.
    const content = buildHy3(syntheticRecords()).replace('Invitational', 'invitational');

    // default ('warn'): collected as a warning, record still parsed
    const parsed = parseHy3(content);
    expect(parsed.warnings.filter((w) => w.code === 'checksum-mismatch').length).toBe(1);
    expect(parsed.byType.meets[0]!.meetName).toBe('SwimLib invitational');

    // 'error': throws
    expect(() => parseHy3(content, { checksum: 'error' })).toThrow(Hy3ParseError);
    expect(() => parseHy3(content, { checksum: 'error' })).toThrow(/checksum mismatch/);

    // 'ignore': accepted without warnings
    const ignored = parseHy3(content, { checksum: 'ignore' });
    expect(ignored.warnings).toEqual([]);
    expect(ignored.byType.meets[0]!.meetName).toBe('SwimLib invitational');
  });

  it('collects unknown record types as warnings', () => {
    const bogus = 'Q9'.padEnd(128, ' ');
    const content = bogus + computeHy3Checksum(bogus) + '\r\n' + buildHy3(syntheticRecords());
    const parsed = parseHy3(content);
    expect(parsed.warnings.length).toBe(1);
    expect(parsed.warnings[0]!.code).toBe('unknown-record-type');
    expect(parsed.warnings[0]!.line).toBe(1);
    expect(parsed.records.length).toBe(25);
  });

  it('pads short lines to 130 characters before verifying', () => {
    const truncated = buildHy3(syntheticRecords()).split('\r\n')[0]!.substring(0, 100);
    // Checksum was cut off → mismatch warning by default, but still parsed.
    const parsed = parseHy3(truncated);
    expect(parsed.warnings.some((w) => w.code === 'checksum-mismatch')).toBe(true);
    expect(parsed.byType.fileDescriptions.length).toBe(1);

    // With verification off it parses cleanly.
    const ignored = parseHy3(truncated, { checksum: 'ignore' });
    expect(ignored.warnings).toEqual([]);
    expect(ignored.byType.fileDescriptions[0]!.fileDescription).toBe('Meet Entries');
  });

  it('throws Hy3BuildError for an empty record list and Hy3ParseError for empty input', () => {
    expect(() => buildHy3([])).toThrow(Hy3BuildError);
    expect(() => parseHy3('\r\n\r\n')).toThrow(Hy3ParseError);
  });

  it('parses a real DQ result sequence (D1/E1/E2/G1/H1) with no warnings', () => {
    // Verbatim lines from a real Hy-Tek results export: a finals 200 swim
    // DQ'd with reason 3H, followed by the H1 spelling out the reason.
    // (This export carries data in a few E2/E1/D1 columns the layouts do
    // not model yet, so only the G1/H1 lines round-trip byte-identically.)
    const lines = [
      'D1F 2411Rose                Karen                                    129159957      136506251963 62     0                   N   88',
      'E1F 2411Rose FW   200C  0109  0S  0.00  5   218.31S  218.31S    0.00    0.00   NN               N                               89',
      'E2F  216.35SQ3H    0  6  1  0   0  0  216.42  216.37    0.00       216.35     0.00     05162025                           0     27',
      'G1F 2   50.76F 4  105.63F 6  162.89F 8  216.35                                                                                  84',
      'H13HAt the turn or finish did not touch with both hands simultaneously/separated                                                35',
    ];
    const content = lines.join('\r\n') + '\r\n';

    const parsed = parseHy3(content);
    expect(parsed.warnings).toEqual([]);
    expect(parsed.records.length).toBe(5);

    const result = parsed.byType.individualResults[0]!;
    expect(result.time!.getHundredths()).toBe(21635);
    expect(result.resultStatusCode).toBe('Q');
    expect(result.dqReasonCode).toBe('3H');

    const dq = parsed.byType.dqDescriptions[0]!;
    expect(dq.dqReasonCode).toBe('3H');
    expect(dq.description).toBe(
      'At the turn or finish did not touch with both hands simultaneously/separated',
    );

    expect(parsed.byType.splits[0]!.toRecord()).toBe(lines[3]);
    expect(dq.toRecord()).toBe(lines[4]);
    // The rebuilt E2 preserves the status and reason columns.
    const rebuiltE2 = result.toRecord();
    expect(rebuiltE2.substring(11, 15)).toBe('SQ3H');
  });
});
