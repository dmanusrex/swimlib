import { describe, expect, it } from 'vitest';
import { SwimTime } from '../../src/core/swimtime';
import { computeHy3Checksum } from '../../src/hy3/checksum';
import {
  CustomFieldsRecord,
  DqDescriptionRecord,
  EmergencyContactRecord,
  FileCode,
  FileDescription,
  FillerRecord,
  GuardianNamesRecord,
  GuardianPhonesRecord,
  IndividualEventRecord,
  IndividualInfoRecord,
  IndividualResultRecord,
  MedicalConditionRecord,
  MedicationRecord,
  MeetRecord,
  MeetTypeRecord,
  MotherEmailRecord,
  RECORD_LENGTH,
  RegistrationRecord,
  RelayNameRecord,
  RelayResultRecord,
  RelayTeamRecord,
  ResultStatusCode,
  ResultTypeCode,
  RoundCode,
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
  TeamStaffRecord,
  type HytekRecord,
} from '../../src/hy3/index';

/** Assert the fundamentals of a serialized line for any record. */
function expectWellFormed(record: HytekRecord, identifier: string): string {
  const line = record.toRecord();
  expect(line.length).toBe(RECORD_LENGTH);
  expect(line.substring(0, 2)).toBe(identifier);
  expect(line.substring(128, 130)).toBe(computeHy3Checksum(line));
  return line;
}

describe('A1 FileDescription', () => {
  it('round-trips through toRecord/fromRecord', () => {
    const record = new FileDescription({
      fileCode: FileCode.MEET_ENTRIES,
      fileDescription: 'Meet Entries',
      softwareVendor: 'SwimLib Project',
      softwareName: 'SwimLib 0.0.0',
      creationDate: new Date(Date.UTC(2026, 6, 1)),
      creationTime: '09:15 AM',
      licensee: 'Etobicoke Swim Club',
    });
    const line = expectWellFormed(record, 'A1');
    expect(line.substring(2, 4)).toBe('02');
    expect(line.substring(4, 16)).toBe('Meet Entries');
    expect(line.substring(29, 44)).toBe('SwimLib Project');
    expect(line.substring(44, 57)).toBe('SwimLib 0.0.0');
    expect(line.substring(58, 66)).toBe('07012026');
    expect(line[66]).toBe(' ');
    expect(line.substring(67, 75)).toBe('09:15 AM');
    expect(line.substring(75, 94)).toBe('Etobicoke Swim Club');

    const parsed = FileDescription.fromRecord(line);
    expect(parsed.fileCode).toBe(FileCode.MEET_ENTRIES);
    expect(parsed.fileDescription).toBe('Meet Entries');
    expect(parsed.softwareVendor).toBe('SwimLib Project');
    expect(parsed.softwareName).toBe('SwimLib 0.0.0');
    expect(parsed.creationDate).toEqual(new Date(Date.UTC(2026, 6, 1)));
    expect(parsed.creationTime).toBe('09:15 AM');
    expect(parsed.licensee).toBe('Etobicoke Swim Club');
  });
});

describe('B1 MeetRecord', () => {
  it('round-trips through toRecord/fromRecord', () => {
    const record = new MeetRecord({
      meetName: 'SwimLib Invitational',
      meetFacility: 'Test Aquatic Centre',
      meetStartDate: new Date(Date.UTC(2026, 6, 10)),
      meetEndDate: new Date(Date.UTC(2026, 6, 12)),
      ageUpDate: new Date(Date.UTC(2026, 6, 10)),
      poolAltitudeMeters: 123,
    });
    const line = expectWellFormed(record, 'B1');
    // Elevation is 5 wide at 0-based [116:120].
    expect(line.substring(116, 121)).toBe('  123');
    expect(line[121]).toBe(' ');

    const parsed = MeetRecord.fromRecord(line);
    expect(parsed.meetName).toBe('SwimLib Invitational');
    expect(parsed.meetFacility).toBe('Test Aquatic Centre');
    expect(parsed.meetStartDate).toEqual(new Date(Date.UTC(2026, 6, 10)));
    expect(parsed.meetEndDate).toEqual(new Date(Date.UTC(2026, 6, 12)));
    expect(parsed.ageUpDate).toEqual(new Date(Date.UTC(2026, 6, 10)));
    expect(parsed.poolAltitudeMeters).toBe(123);
  });
});

describe('C1 TeamRecord', () => {
  it('round-trips and uppercases the team code', () => {
    const record = new TeamRecord({
      teamCode: 'eswim',
      name: 'Etobicoke Swimming',
      abbreviation: 'ESWIM',
      lsc: 'ON',
      teamType: 'AGE',
    });
    const line = expectWellFormed(record, 'C1');
    expect(line.substring(2, 7)).toBe('ESWIM');
    expect(line.substring(119, 122)).toBe('AGE');

    const parsed = TeamRecord.fromRecord(line);
    expect(parsed.teamCode).toBe('ESWIM');
    expect(parsed.name).toBe('Etobicoke Swimming');
    expect(parsed.abbreviation).toBe('ESWIM');
    expect(parsed.lsc).toBe('ON');
    expect(parsed.teamType).toBe('AGE');
  });
});

describe('C2 TeamAddressRecord', () => {
  it('round-trips and uppercases the country code', () => {
    const record = new TeamAddressRecord({
      mailTo: 'Jane Coach',
      address: '123 Pool Lane',
      city: 'Toronto',
      state: 'ON',
      postalCode: '90210',
      country: 'can',
      teamRegistration: 'OTH',
    });
    const line = expectWellFormed(record, 'C2');

    const parsed = TeamAddressRecord.fromRecord(line);
    expect(parsed.mailTo).toBe('Jane Coach');
    expect(parsed.address).toBe('123 Pool Lane');
    expect(parsed.city).toBe('Toronto');
    expect(parsed.state).toBe('ON');
    expect(parsed.postalCode).toBe('90210');
    expect(parsed.country).toBe('CAN');
    expect(parsed.teamRegistration).toBe('OTH');
  });
});

describe('C3 TeamContactRecord', () => {
  it('round-trips through toRecord/fromRecord', () => {
    const record = new TeamContactRecord({
      daytimePhone: '416-555-1234',
      eveningPhone: '416-555-5678',
      fax: '416-555-9999',
      email: 'coach@example.com',
    });
    const line = expectWellFormed(record, 'C3');

    const parsed = TeamContactRecord.fromRecord(line);
    expect(parsed.daytimePhone).toBe('416-555-1234');
    expect(parsed.eveningPhone).toBe('416-555-5678');
    expect(parsed.fax).toBe('416-555-9999');
    expect(parsed.email).toBe('coach@example.com');
  });
});

describe('C6 TeamStaffRecord', () => {
  it('round-trips name and role at the TM8 columns', () => {
    const record = new TeamStaffRecord({
      name: 'Sam French',
      role: 'Head Coach',
    });
    const line = expectWellFormed(record, 'C6');
    // Real TM8 exports: name at 0-based [2:31], role at [32:51]
    // ('C6Sam French                    Head Coach          …').
    expect(line.substring(2, 32)).toBe('Sam French'.padEnd(30));
    expect(line.substring(32, 52)).toBe('Head Coach'.padEnd(20));

    const parsed = TeamStaffRecord.fromRecord(line);
    expect(parsed.name).toBe('Sam French');
    expect(parsed.role).toBe('Head Coach');
  });
});

describe('D1 IndividualInfoRecord', () => {
  it('round-trips, including a Date birth date and a two-digit age', () => {
    const record = new IndividualInfoRecord({
      swimmerGender: SexCode.FEMALE,
      swimmerId: '769',
      swimmerLastName: 'Azbill',
      swimmerFirstName: 'Millicent',
      swimmerNickName: 'Miley',
      swimmerMiddleInitial: 'C',
      swimmerBirthDate: new Date(Date.UTC(2001, 0, 21)),
      swimmerAge: 11,
    });
    const line = expectWellFormed(record, 'D1');

    const parsed = IndividualInfoRecord.fromRecord(line);
    expect(parsed.swimmerGender).toBe(SexCode.FEMALE);
    expect(parsed.swimmerId).toBe('769');
    expect(parsed.swimmerLastName).toBe('Azbill');
    expect(parsed.swimmerFirstName).toBe('Millicent');
    expect(parsed.swimmerNickName).toBe('Miley');
    expect(parsed.swimmerMiddleInitial).toBe('C');
    expect(parsed.swimmerBirthDate).toEqual(new Date(Date.UTC(2001, 0, 21)));
    expect(parsed.swimmerAge).toBe(11);
  });
});

describe('E1 IndividualEventRecord', () => {
  it('round-trips entries with seed times', () => {
    const record = new IndividualEventRecord({
      swimmerGender: SexCode.MALE,
      swimmerId: '12',
      swimmerAbbr: 'BYBEE',
      gender1: SexCode.MALE,
      gender2: SexCode.MALE,
      distance: '100',
      stroke: StrokeCode.INDIVIDUAL_MEDLEY,
      ageLower: '11',
      ageUpper: '12',
      eventFee: '3.50',
      eventNumber: '202',
      seedTime1: SwimTime.fromString('1:21.24'),
      seedCourse1: 'Y',
    });
    const line = expectWellFormed(record, 'E1');
    // Distance is %6.6s right-justified at 0-based [15:20] plus the stroke
    // letter at [21]
    expect(line.substring(15, 22)).toBe('   100E');

    const parsed = IndividualEventRecord.fromRecord(line);
    expect(parsed.swimmerGender).toBe(SexCode.MALE);
    expect(parsed.swimmerId).toBe('12');
    expect(parsed.swimmerAbbr).toBe('BYBEE');
    expect(parsed.distance).toBe('100');
    expect(parsed.stroke).toBe(StrokeCode.INDIVIDUAL_MEDLEY);
    expect(parsed.ageLower).toBe('11');
    expect(parsed.ageUpper).toBe('12');
    expect(parsed.eventFee).toBe('3.50');
    expect(parsed.eventNumber).toBe('202');
    expect(parsed.seedTime1!.getHundredths()).toBe(8124);
    expect(parsed.seedCourse1).toBe('Y');
  });

  it('leaves the seed-time columns blank when no seed time is set', () => {
    // Real TM8 exports leave missing seed times blank (no 'NT' filler —
    // verified against a TM8 results export where all E1 seed columns are
    // blank).
    const record = new IndividualEventRecord({
      swimmerId: '12',
      swimmerAbbr: 'BYBEE',
      distance: '100',
      stroke: StrokeCode.FREESTYLE,
    });
    const line = record.toRecord();
    // seedTime1 occupies 1-based 52..59 → 0-based 51..58.
    expect(line.substring(51, 59)).toBe('        ');
    const parsed = IndividualEventRecord.fromRecord(line);
    expect(parsed.seedTime1).toBeNull();
  });
});

describe('F1 RelayTeamRecord', () => {
  it('round-trips the reconciled entry layout', () => {
    const record = new RelayTeamRecord({
      teamAbbr: 'KZY',
      relayTeam: 'a',
      relayGender: 'F',
      relayGender1: 'F',
      relayGender2: 'F',
      relayDistance: 200,
      stroke: StrokeCode.FREESTYLE,
      ageLower: '09',
      ageUpper: '10',
      eventFee: '12.00',
      eventNumber: '255',
      seedTime1: SwimTime.fromString('2:26.99'),
      seedCourse1: 'Y',
      seedTime2: SwimTime.fromString('2:30.10'),
      seedCourse2: 'L',
    });
    const line = expectWellFormed(record, 'F1');
    // relayTeam is uppercased at 0-based position 7.
    expect(line[7]).toBe('A');
    // Relay distance is %6.6s right-justified at 0-based [15:20] plus the
    // stroke letter at [21]
    expect(line.substring(15, 22)).toBe('   200A');

    const parsed = RelayTeamRecord.fromRecord(line);
    expect(parsed.teamAbbr).toBe('KZY');
    expect(parsed.relayTeam).toBe('A');
    expect(parsed.relayGender).toBe('F');
    expect(parsed.relayGender1).toBe('F');
    expect(parsed.relayGender2).toBe('F');
    expect(parsed.relayDistance).toBe(200);
    expect(parsed.stroke).toBe(StrokeCode.FREESTYLE);
    expect(parsed.ageLower).toBe('09');
    expect(parsed.ageUpper).toBe('10');
    expect(parsed.eventFee).toBe('12.00');
    expect(parsed.eventNumber).toBe('255');
    expect(parsed.seedTime1!.getHundredths()).toBe(14699);
    expect(parsed.seedCourse1).toBe('Y');
    expect(parsed.seedTime2!.getHundredths()).toBe(15010);
    expect(parsed.seedCourse2).toBe('L');
  });
});

describe('F3 RelayNameRecord', () => {
  it('round-trips all four relay legs', () => {
    const record = new RelayNameRecord({
      swimmer1Gender: SexCode.FEMALE,
      swimmer1Id: '101',
      swimmer1Abbr: 'SMITH',
      swimmer1Gender2: SexCode.GIRLS,
      swimmer1RelayLeg: 1,
      swimmer2Gender: SexCode.FEMALE,
      swimmer2Id: '102',
      swimmer2Abbr: 'JONES',
      swimmer2Gender2: SexCode.GIRLS,
      swimmer2RelayLeg: 2,
      swimmer3Gender: SexCode.FEMALE,
      swimmer3Id: '103',
      swimmer3Abbr: 'WONG',
      swimmer3Gender2: SexCode.GIRLS,
      swimmer3RelayLeg: 3,
      swimmer4Gender: SexCode.FEMALE,
      swimmer4Id: '104',
      swimmer4Abbr: 'GARCI',
      swimmer4Gender2: SexCode.GIRLS,
      swimmer4RelayLeg: 4,
    });
    const line = expectWellFormed(record, 'F3');

    const parsed = RelayNameRecord.fromRecord(line);
    expect(parsed.swimmer1Id).toBe('101');
    expect(parsed.swimmer1Abbr).toBe('SMITH');
    expect(parsed.swimmer1RelayLeg).toBe(1);
    expect(parsed.swimmer2Id).toBe('102');
    expect(parsed.swimmer2RelayLeg).toBe(2);
    expect(parsed.swimmer3Abbr).toBe('WONG');
    expect(parsed.swimmer3RelayLeg).toBe(3);
    expect(parsed.swimmer4Gender).toBe(SexCode.FEMALE);
    expect(parsed.swimmer4Gender2).toBe(SexCode.GIRLS);
    expect(parsed.swimmer4RelayLeg).toBe(4);
  });
});

describe('G1 SplitRecord', () => {
  it('round-trips a variable number of split slots', () => {
    const record = new SplitRecord({
      splitResultType1: ResultTypeCode.FINAL,
      splitLength1: 2,
      splitTime1: SwimTime.fromString('29.13'),
      splitResultType2: ResultTypeCode.FINAL,
      splitLength2: 4,
      splitTime2: SwimTime.fromString('1:01.05'),
      splitResultType3: ResultTypeCode.FINAL,
      splitLength3: 6,
      splitTime3: SwimTime.fromString('1:34.46'),
    });
    const line = expectWellFormed(record, 'G1');
    // Slot 1 occupies 0-based [2:12]: type, 2-char length, 8-char time.
    expect(line.substring(2, 13)).toBe('F 2   29.13');
    // Slot 2 starts 11 characters later. Times over a minute are written
    // as raw seconds ('61.05', not '1:01.05') — Hy-Tek's own convention,
    // verified against real TM8 G1 output.
    expect(line.substring(13, 24)).toBe('F 4   61.05');

    const parsed = SplitRecord.fromRecord(line);
    expect(parsed.splitResultType1).toBe(ResultTypeCode.FINAL);
    expect(parsed.splitLength1).toBe(2);
    expect(parsed.splitTime1!.getHundredths()).toBe(2913);
    expect(parsed.splitLength2).toBe(4);
    expect(parsed.splitTime2!.getHundredths()).toBe(6105);
    expect(parsed.splitLength3).toBe(6);
    expect(parsed.splitTime3!.getHundredths()).toBe(9446);
    expect(parsed.splitResultType4).toBeNull();
    expect(parsed.splitTime10).toBeNull();
  });
});

describe('B2 MeetTypeRecord', () => {
  it('round-trips masters/meetType/course codes at the generator columns', () => {
    const record = new MeetTypeRecord({
      masters: '06',
      meetType: 'AG',
      courseCode1: 'Y',
      courseCode2: 'Y',
    });
    const line = expectWellFormed(record, 'B2');
    // 0-based: masters [94:95], meetType [96:97], course1 [98], course2 [106]
    // (course2's position is settled by real TM8 output — see meet-type.ts).
    expect(line.substring(94, 99)).toBe('06AGY');
    expect(line[106]).toBe('Y');

    const parsed = MeetTypeRecord.fromRecord(line);
    expect(parsed.masters).toBe('06');
    expect(parsed.meetType).toBe('AG');
    expect(parsed.courseCode1).toBe('Y');
    expect(parsed.courseCode2).toBe('Y');
  });
});

describe('D2 SwimmerAddressRecord', () => {
  it('round-trips through toRecord/fromRecord', () => {
    const record = new SwimmerAddressRecord({
      address1: '123 Pool Lane',
      address2: 'Unit 4',
      city: 'Toronto',
      state: 'ON',
      postalCode: 'M9B 1B1',
      country: 'CAN',
    });
    const line = expectWellFormed(record, 'D2');

    const parsed = SwimmerAddressRecord.fromRecord(line);
    expect(parsed.address1).toBe('123 Pool Lane');
    expect(parsed.address2).toBe('Unit 4');
    expect(parsed.city).toBe('Toronto');
    expect(parsed.state).toBe('ON');
    expect(parsed.postalCode).toBe('M9B 1B1');
    expect(parsed.country).toBe('CAN');
  });
});

describe('D3 SwimmerPhoneRecord', () => {
  it('round-trips through toRecord/fromRecord', () => {
    const record = new SwimmerPhoneRecord({
      phone1: '416-555-1111',
      phone2: '416-555-2222',
      fax: '416-555-3333',
      email: 'father@example.com',
    });
    const line = expectWellFormed(record, 'D3');
    // 0-based: unused [2:31], phone1 starts at [32].
    expect(line.substring(2, 32)).toBe(' '.repeat(30));
    expect(line.substring(32, 44)).toBe('416-555-1111');

    const parsed = SwimmerPhoneRecord.fromRecord(line);
    expect(parsed.phone1).toBe('416-555-1111');
    expect(parsed.phone2).toBe('416-555-2222');
    expect(parsed.fax).toBe('416-555-3333');
    expect(parsed.email).toBe('father@example.com');
  });
});

describe('D4 SecondaryContactAddressRecord', () => {
  it('round-trips through toRecord/fromRecord', () => {
    const record = new SecondaryContactAddressRecord({
      mailTo: 'Pat Guardian',
      address1: '99 Deck Street',
      city: 'Etobicoke',
      state: 'ON',
      postalCode: 'M8V 2W2',
      country: 'CAN',
    });
    const line = expectWellFormed(record, 'D4');

    const parsed = SecondaryContactAddressRecord.fromRecord(line);
    expect(parsed.mailTo).toBe('Pat Guardian');
    expect(parsed.address1).toBe('99 Deck Street');
    expect(parsed.city).toBe('Etobicoke');
    expect(parsed.state).toBe('ON');
    expect(parsed.postalCode).toBe('M8V 2W2');
    expect(parsed.country).toBe('CAN');
  });
});

describe('D5 RegistrationRecord', () => {
  it('emits the literal constants at the generator columns', () => {
    const record = new RegistrationRecord({
      primaryMailTo: 'Jane Parent',
      secondaryAddress2: 'Suite 12',
      registrationDate: '2026',
      primaryCityOverflow: 'Overflow',
      secondaryCityOverflow: 'MoreCity',
    });
    const line = expectWellFormed(record, 'D5');
    // Literals at 0-based [72] and [74:86]; unused byte at [73].
    expect(line[72]).toBe('X');
    expect(line[73]).toBe(' ');
    expect(line.substring(74, 87)).toBe('FFFFFFFFFFFFF');
    // registrationDate [87:90], overflows at [99:106] and [107:116].
    expect(line.substring(87, 91)).toBe('2026');
    expect(line.substring(99, 107)).toBe('Overflow');
    expect(line.substring(107, 115)).toBe('MoreCity');

    const parsed = RegistrationRecord.fromRecord(line);
    expect(parsed.primaryMailTo).toBe('Jane Parent');
    expect(parsed.secondaryAddress2).toBe('Suite 12');
    expect(parsed.registrationDate).toBe('2026');
    expect(parsed.primaryCityOverflow).toBe('Overflow');
    expect(parsed.secondaryCityOverflow).toBe('MoreCity');
    expect(parsed.literalX).toBe('X');
    expect(parsed.literalF).toBe('FFFFFFFFFFFFF');
  });

  it('normalizes junk in the literal columns on parse', () => {
    const record = new RegistrationRecord();
    const line = record.toRecord();
    const corrupted = line.substring(0, 72) + 'Q' + line.substring(73);
    const parsed = RegistrationRecord.fromRecord(corrupted);
    expect(parsed.literalX).toBe('X');
  });
});

describe('D6 EmergencyContactRecord', () => {
  it('round-trips through toRecord/fromRecord', () => {
    const record = new EmergencyContactRecord({
      doctorName: 'Dr Emma Waters',
      doctorPhone: '416-555-4444',
      emergencyName: 'Uncle Bob',
      emergencyPhone: '416-555-5555',
    });
    const line = expectWellFormed(record, 'D6');

    const parsed = EmergencyContactRecord.fromRecord(line);
    expect(parsed.doctorName).toBe('Dr Emma Waters');
    expect(parsed.doctorPhone).toBe('416-555-4444');
    expect(parsed.emergencyName).toBe('Uncle Bob');
    expect(parsed.emergencyPhone).toBe('416-555-5555');
  });
});

describe('D7 SecondaryContactPhoneRecord', () => {
  it('round-trips through toRecord/fromRecord', () => {
    const record = new SecondaryContactPhoneRecord({
      parent1OfficePhone: '416-555-6666',
      homePhone: '416-555-7777',
      fax: '416-555-8888',
      parent1Email: 'secondary@example.com',
      cityOverflow: 'CityTail',
    });
    const line = expectWellFormed(record, 'D7');

    const parsed = SecondaryContactPhoneRecord.fromRecord(line);
    expect(parsed.parent1OfficePhone).toBe('416-555-6666');
    expect(parsed.homePhone).toBe('416-555-7777');
    expect(parsed.fax).toBe('416-555-8888');
    expect(parsed.parent1Email).toBe('secondary@example.com');
    expect(parsed.cityOverflow).toBe('CityTail');
  });
});

describe('D8 MedicalConditionRecord', () => {
  it('round-trips a 120-character description column', () => {
    const record = new MedicalConditionRecord({ description: 'Mild asthma - carries inhaler' });
    const line = expectWellFormed(record, 'D8');
    expect(line.substring(2, 31)).toBe('Mild asthma - carries inhaler');

    const parsed = MedicalConditionRecord.fromRecord(line);
    expect(parsed.description).toBe('Mild asthma - carries inhaler');
  });
});

describe('D9 MedicationRecord', () => {
  it('round-trips a 120-character description column', () => {
    const record = new MedicationRecord({ description: 'Salbutamol as needed' });
    const line = expectWellFormed(record, 'D9');

    const parsed = MedicationRecord.fromRecord(line);
    expect(parsed.description).toBe('Salbutamol as needed');
  });
});

describe('DA CustomFieldsRecord', () => {
  it('round-trips three name/value pairs', () => {
    const record = new CustomFieldsRecord({
      field1Name: 'Squad',
      field1Value: 'Senior',
      field2Name: 'Locker',
      field2Value: '42',
      field3Name: 'Carpool',
      field3Value: 'Yes',
    });
    const line = expectWellFormed(record, 'DA');

    const parsed = CustomFieldsRecord.fromRecord(line);
    expect(parsed.field1Name).toBe('Squad');
    expect(parsed.field1Value).toBe('Senior');
    expect(parsed.field2Name).toBe('Locker');
    expect(parsed.field2Value).toBe('42');
    expect(parsed.field3Name).toBe('Carpool');
    expect(parsed.field3Value).toBe('Yes');
  });
});

describe('DB GuardianNamesRecord', () => {
  it('round-trips through toRecord/fromRecord', () => {
    const record = new GuardianNamesRecord({
      fatherLastName: 'Azbill',
      fatherFirstName: 'Frank',
      motherFirstName: 'Mary',
      secondaryLastName: 'Guardian',
      secondaryParent1Name: 'Pat',
      secondaryParent2Name: 'Sam',
    });
    const line = expectWellFormed(record, 'DB');

    const parsed = GuardianNamesRecord.fromRecord(line);
    expect(parsed.fatherLastName).toBe('Azbill');
    expect(parsed.fatherFirstName).toBe('Frank');
    expect(parsed.motherFirstName).toBe('Mary');
    expect(parsed.secondaryLastName).toBe('Guardian');
    expect(parsed.secondaryParent1Name).toBe('Pat');
    expect(parsed.secondaryParent2Name).toBe('Sam');
  });
});

describe('DC FillerRecord', () => {
  it('emits an all-blank body followed by a valid checksum', () => {
    const line = expectWellFormed(new FillerRecord(), 'DC');
    expect(line.substring(2, 128)).toBe(' '.repeat(126));
  });

  it('fromRecord accepts a DC line with arbitrary body content', () => {
    const body = ('DC' + 'junk data that should be ignored').padEnd(128, ' ');
    const parsed = FillerRecord.fromRecord(body + '00');
    expect(parsed.toRecord().substring(2, 128)).toBe(' '.repeat(126));
  });
});

describe('DD GuardianPhonesRecord', () => {
  it('round-trips through toRecord/fromRecord', () => {
    const record = new GuardianPhonesRecord({
      fatherCellPhone: '416-555-0001',
      motherOfficePhone: '416-555-0002',
      motherCellPhone: '416-555-0003',
      secondaryParent1CellPhone: '416-555-0004',
      secondaryParent2OfficePhone: '416-555-0005',
      secondaryParent2CellPhone: '416-555-0006',
    });
    const line = expectWellFormed(record, 'DD');

    const parsed = GuardianPhonesRecord.fromRecord(line);
    expect(parsed.fatherCellPhone).toBe('416-555-0001');
    expect(parsed.motherOfficePhone).toBe('416-555-0002');
    expect(parsed.motherCellPhone).toBe('416-555-0003');
    expect(parsed.secondaryParent1CellPhone).toBe('416-555-0004');
    expect(parsed.secondaryParent2OfficePhone).toBe('416-555-0005');
    expect(parsed.secondaryParent2CellPhone).toBe('416-555-0006');
  });
});

describe('DE MotherEmailRecord', () => {
  it('round-trips through toRecord/fromRecord', () => {
    const record = new MotherEmailRecord({
      motherEmail: 'mother@example.com',
      secondaryParent2Email: 'parent2@example.com',
      motherEmailOverflow: 'tail@part',
      motherLastName: 'Azbill',
    });
    const line = expectWellFormed(record, 'DE');

    const parsed = MotherEmailRecord.fromRecord(line);
    expect(parsed.motherEmail).toBe('mother@example.com');
    expect(parsed.secondaryParent2Email).toBe('parent2@example.com');
    expect(parsed.motherEmailOverflow).toBe('tail@part');
    expect(parsed.motherLastName).toBe('Azbill');
  });
});

describe('DF SwimmerContactRecord', () => {
  it('round-trips through toRecord/fromRecord', () => {
    const record = new SwimmerContactRecord({
      middleName: 'Catherine',
      cellPhone: '416-555-9999',
      email: 'swimmer@example.com',
    });
    const line = expectWellFormed(record, 'DF');

    const parsed = SwimmerContactRecord.fromRecord(line);
    expect(parsed.middleName).toBe('Catherine');
    expect(parsed.cellPhone).toBe('416-555-9999');
    expect(parsed.email).toBe('swimmer@example.com');
  });
});

describe('E2 IndividualResultRecord', () => {
  it('round-trips through toRecord/fromRecord', () => {
    const record = new IndividualResultRecord({
      round: RoundCode.FINALS,
      time: SwimTime.fromString('48.51'),
      course: 'Y',
      heat: 4,
      lane: 3,
      heatPlace: 1,
      overallPlace: 2,
      points: 17,
      backupTime1: SwimTime.fromString('48.53'),
      backupTime2: SwimTime.fromString('48.49'),
      touchpadTime1: SwimTime.fromString('48.51'),
      reactionTime: 0.68,
      dayOfEvent: new Date(Date.UTC(2026, 6, 11)),
    });
    const line = expectWellFormed(record, 'E2');
    // Anchor columns (0-based): round [2], time [3:10], course [11].
    expect(line[2]).toBe('F');
    expect(line.substring(3, 11)).toBe('   48.51');
    expect(line[11]).toBe('Y');

    const parsed = IndividualResultRecord.fromRecord(line);
    expect(parsed.round).toBe(RoundCode.FINALS);
    expect(parsed.time!.getHundredths()).toBe(4851);
    expect(parsed.course).toBe('Y');
    expect(parsed.heat).toBe(4);
    expect(parsed.lane).toBe(3);
    expect(parsed.heatPlace).toBe(1);
    expect(parsed.overallPlace).toBe(2);
    expect(parsed.points).toBe(17);
    expect(parsed.backupTime1!.getHundredths()).toBe(4853);
    expect(parsed.backupTime2!.getHundredths()).toBe(4849);
    expect(parsed.touchpadTime1!.getHundredths()).toBe(4851);
    expect(parsed.reactionTime).toBe(0.68);
    expect(parsed.dayOfEvent).toEqual(new Date(Date.UTC(2026, 6, 11)));
  });

  it('carries DQ results via the status and reason columns', () => {
    const record = new IndividualResultRecord({
      round: RoundCode.PRELIMS,
      resultStatusCode: ResultStatusCode.DISQUALIFIED,
      dqReasonCode: '3H',
      heat: 2,
      lane: 5,
    });
    const line = expectWellFormed(record, 'E2');
    // Anchor columns (0-based): status [12], DQ reason [13:15).
    expect(line[12]).toBe('Q');
    expect(line.substring(13, 15)).toBe('3H');
    const parsed = IndividualResultRecord.fromRecord(line);
    expect(parsed.round).toBe(RoundCode.PRELIMS);
    expect(parsed.resultStatusCode).toBe(ResultStatusCode.DISQUALIFIED);
    expect(parsed.dqReasonCode).toBe('3H');
    expect(parsed.time).toBeNull();
  });

  it('parses a real DQ result line', () => {
    const line =
      'E2F  216.35SQ3H    0  6  1  0   0  0  216.42  216.37    0.00       216.35     0.00     05162025                           0     27';
    expect(line.length).toBe(RECORD_LENGTH);
    expect(computeHy3Checksum(line)).toBe('27');
    const parsed = IndividualResultRecord.fromRecord(line);
    expect(parsed.round).toBe(RoundCode.FINALS);
    expect(parsed.time!.getHundredths()).toBe(21635);
    expect(parsed.course).toBe('S');
    expect(parsed.resultStatusCode).toBe(ResultStatusCode.DISQUALIFIED);
    expect(parsed.dqReasonCode).toBe('3H');
  });
});

describe('H1 DqDescriptionRecord', () => {
  it('round-trips through toRecord/fromRecord', () => {
    const record = new DqDescriptionRecord({
      dqReasonCode: '3H',
      description: 'At the turn or finish did not touch with both hands simultaneously/separated',
    });
    const line = expectWellFormed(record, 'H1');
    expect(line.substring(2, 4)).toBe('3H');
    const parsed = DqDescriptionRecord.fromRecord(line);
    expect(parsed.dqReasonCode).toBe('3H');
    expect(parsed.description).toBe(
      'At the turn or finish did not touch with both hands simultaneously/separated',
    );
  });

  it('reproduces a real DQ description line byte-for-byte', () => {
    const line =
      'H13HAt the turn or finish did not touch with both hands simultaneously/separated                                                35';
    expect(line.length).toBe(RECORD_LENGTH);
    expect(computeHy3Checksum(line)).toBe('35');
    const parsed = DqDescriptionRecord.fromRecord(line);
    expect(parsed.dqReasonCode).toBe('3H');
    expect(parsed.description).toBe(
      'At the turn or finish did not touch with both hands simultaneously/separated',
    );
    expect(parsed.toRecord()).toBe(line);
  });
});

describe('F2 RelayResultRecord', () => {
  it('round-trips through toRecord/fromRecord', () => {
    const record = new RelayResultRecord({
      round: RoundCode.FINALS,
      time: SwimTime.fromString('1:45.10'),
      course: 'S',
      heat: 1,
      lane: 4,
      heatPlace: 1,
      overallPlace: 1,
      points: 34,
      backupTime1: SwimTime.fromString('1:45.12'),
      backupTime3: SwimTime.fromString('1:45.08'),
      touchpadTime: SwimTime.fromString('1:45.10'),
      reactionTime1: 0.72,
      reactionTime2: 0.31,
      reactionTime3: 0.28,
      reactionTime4: 0.25,
    });
    const line = expectWellFormed(record, 'F2');
    expect(line[2]).toBe('F');
    expect(line[11]).toBe('S');

    const parsed = RelayResultRecord.fromRecord(line);
    expect(parsed.round).toBe(RoundCode.FINALS);
    expect(parsed.time!.getHundredths()).toBe(10510);
    expect(parsed.course).toBe('S');
    expect(parsed.overallPlace).toBe(1);
    expect(parsed.points).toBe(34);
    expect(parsed.backupTime1!.getHundredths()).toBe(10512);
    expect(parsed.backupTime3!.getHundredths()).toBe(10508);
    expect(parsed.touchpadTime!.getHundredths()).toBe(10510);
    expect(parsed.reactionTime1).toBe(0.72);
    expect(parsed.reactionTime2).toBe(0.31);
    expect(parsed.reactionTime3).toBe(0.28);
    expect(parsed.reactionTime4).toBe(0.25);
  });

  it('carries DQ results via the status and reason columns', () => {
    const record = new RelayResultRecord({
      round: RoundCode.FINALS,
      resultStatusCode: ResultStatusCode.DISQUALIFIED,
      dqReasonCode: '7P',
    });
    const line = expectWellFormed(record, 'F2');
    expect(line[12]).toBe('Q');
    expect(line.substring(13, 15)).toBe('7P');
    const parsed = RelayResultRecord.fromRecord(line);
    expect(parsed.resultStatusCode).toBe(ResultStatusCode.DISQUALIFIED);
    expect(parsed.dqReasonCode).toBe('7P');
    expect(parsed.time).toBeNull();
  });
});
