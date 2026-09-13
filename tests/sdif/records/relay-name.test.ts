import { describe, expect, it } from 'vitest';

import { RelayNameRecord } from '../../../src/sdif/records/relay-name';
import { OrganizationCode, OrderCode, SexCode, CourseStatusCode } from '../../../src/sdif/codes';
import { SwimTime } from '../../../src/core/swimtime';

describe('RelayNameRecord', () => {
  // Sample data matching the known good record
  const sampleData = {
    organization: OrganizationCode.USS,
    teamCode: 'FAST',
    relayTeamName: 'A',
    swimmerName: 'DOE, JOHN A',
    ussNumber: '123456789012',
    citizen: 'USA',
    birthdate: new Date(Date.UTC(2008, 0, 15)), // January 15, 2008
    ageOrClass: '16',
    sex: SexCode.MALE,
    prelimOrder: OrderCode.FIRST_LEG,
    swimOffOrder: OrderCode.NOT_ON_TEAM,
    finalsOrder: OrderCode.FIRST_LEG,
    legTime: SwimTime.fromString('54.32'),
    course: CourseStatusCode.SHORT_YARDS,
    takeoffTime: 0.73,
    ussNumberNew: '12345678901234',
    preferredFirstName: 'Johnny',
  };

  // This is a known good F0 record
  const knownGoodRecord = [
    'F0', // Identifier (2)
    '1', // Organization (1)
    ' '.repeat(12), // Future use (12)
    'FAST  ', // Team Code (6)
    'A', // Relay Team Name (1)
    'DOE, JOHN A'.padEnd(28), // Swimmer Name (28)
    '123456789012', // USS Number (12)
    'USA', // Citizen (3)
    '01152008', // Birthdate (8)
    '16', // Age/Class (2)
    'M', // Sex (1)
    '1', // Prelim Order (1)
    '0', // Swimoff Order (1)
    '1', // Finals Order (1)
    '   54.32', // Leg Time (8)
    'Y', // Course (1)
    '0.73', // Takeoff Time (4)
    '12345678901234', // New USS Number (14)
    'Johnny'.padEnd(15), // Preferred First Name (15)
    ' '.repeat(39), // Future use (39)
  ].join('');

  it('should create a record matching the known good record', () => {
    const record = new RelayNameRecord(sampleData);
    const formatted = record.toRecord();

    // The actual test
    expect(formatted).toBe(knownGoodRecord);
    expect(formatted.length).toBe(160);
  });

  it('should parse a known good record correctly', () => {
    const parsed = RelayNameRecord.fromRecord(knownGoodRecord);

    expect(parsed.organization).toBe(OrganizationCode.USS);
    expect(parsed.teamCode).toBe('FAST');
    expect(parsed.relayTeamName).toBe('A');
    expect(parsed.swimmerName).toBe('DOE, JOHN A');
    expect(parsed.ussNumber).toBe('123456789012');
    expect(parsed.citizen).toBe('USA');
    expect(parsed.birthdate).toEqual(new Date(Date.UTC(2008, 0, 15)));
    expect(parsed.ageOrClass).toBe('16');
    expect(parsed.sex).toBe(SexCode.MALE);
    expect(parsed.prelimOrder).toBe(OrderCode.FIRST_LEG);
    expect(parsed.swimOffOrder).toBe(OrderCode.NOT_ON_TEAM);
    expect(parsed.finalsOrder).toBe(OrderCode.FIRST_LEG);
    expect(parsed.legTime?.format()).toBe('   54.32');
    expect(parsed.course).toBe(CourseStatusCode.SHORT_YARDS);
    expect(parsed.takeoffTime).toBe(0.73);
    expect(parsed.ussNumberNew).toBe('12345678901234');
    expect(parsed.preferredFirstName).toBe('Johnny');
  });

  it('should validate required fields', () => {
    const record = new RelayNameRecord({
      // Only include mandatory V1 fields
      teamCode: 'FAST',
      relayTeamName: 'A',
      swimmerName: 'DOE, JOHN A',
      sex: SexCode.MALE,
      finalsOrder: OrderCode.FIRST_LEG,
    });

    const validation = record.validate({ treatM2AsOptional: true });
    expect(validation.isValid).toBe(true);
  });

  it('should validate M2 fields when treatM2AsOptional is false', () => {
    const record = new RelayNameRecord({
      teamCode: 'FAST',
      swimmerName: 'DOE, JOHN A',
      sex: SexCode.MALE,
      finalsOrder: OrderCode.FIRST_LEG,
      // Missing M2 fields: organization, birthdate, ussNumberNew
    });

    const validation = record.validate({ treatM2AsOptional: false });
    expect(validation.isValid).toBe(false);

    const missingFields = validation.errors.map((e) => e.field);
    expect(missingFields).toContain('organization');
    expect(missingFields).toContain('birthdate');
    expect(missingFields).toContain('ussNumberNew');
  });

  it('should handle optional fields', () => {
    const record = new RelayNameRecord({
      organization: OrganizationCode.USS,
      swimmerName: 'DOE, JOHN A',
      sex: SexCode.MALE,
      finalsOrder: OrderCode.FIRST_LEG,
      birthdate: new Date(Date.UTC(2008, 0, 15)),
      ussNumberNew: '12345678901234',
      // Include some optional fields
      teamCode: 'FAST',
      relayTeamName: 'A',
      legTime: SwimTime.fromString('54.32'),
      takeoffTime: 0.73,
    });

    const validation = record.validate({ treatM2AsOptional: true });
    expect(validation.isValid).toBe(true);
  });
});
