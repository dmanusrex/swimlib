import { describe, expect, it } from 'vitest';

import { MeetRecord } from '../../../src/sdif/records/meet';
import { OrganizationCode, MeetTypeCode, CourseStatusCode } from '../../../src/sdif/codes';

describe('MeetRecord', () => {
  // Sample data matching the known good record
  const sampleData = {
    organization: OrganizationCode.USS,
    meetName: 'Fast Swimming Championships',
    meetAddress1: '123 Pool Lane',
    meetAddress2: 'Suite 100',
    meetCity: 'Swimville',
    meetState: 'CA',
    meetPostalCode: '12345',
    meetCountry: 'USA',
    meetCode: MeetTypeCode.INVITATIONAL,
    meetStartDate: new Date(Date.UTC(2024, 2, 15)), // March 15, 2024
    meetEndDate: new Date(Date.UTC(2024, 2, 17)), // March 17, 2024
    poolAltitudeFeet: 1000,
    meetCourse: CourseStatusCode.SHORT_YARDS,
  };

  // This is a known good B1 record from the SDIF specification
  const knownGoodRecord = [
    'B1', // Identifier (2)
    '1', // Organization (1)
    ' '.repeat(8), // Future Use (8)
    'Fast Swimming Championships'.padEnd(30), // Meet Name (30)
    '123 Pool Lane'.padEnd(22), // Address 1 (22)
    'Suite 100'.padEnd(22), // Address 2 (22)
    'Swimville'.padEnd(20), // City (20)
    'CA', // State (2)
    '12345'.padEnd(10), // Postal Code (10)
    'USA', // Country (3)
    '1', // Meet Code (1)
    '03152024', // Start Date (8)
    '03172024', // End Date (8)
    '1000', // Pool Altitude (4)
    ' '.repeat(8), // Future Use (8)
    'Y', // Course (1)
    ' '.repeat(10), // Future Use (10)
  ].join('');

  it('should create a record matching the known good record', () => {
    const record = new MeetRecord(sampleData);
    const formatted = record.toRecord();

    // The actual test
    expect(formatted).toBe(knownGoodRecord);
    expect(formatted.length).toBe(160);
  });

  it('should parse a known good record correctly', () => {
    const parsed = MeetRecord.fromRecord(knownGoodRecord);

    expect(parsed.organization).toBe(OrganizationCode.USS);
    expect(parsed.meetName).toBe('Fast Swimming Championships');
    expect(parsed.meetAddress1).toBe('123 Pool Lane');
    expect(parsed.meetAddress2).toBe('Suite 100');
    expect(parsed.meetCity).toBe('Swimville');
    expect(parsed.meetState).toBe('CA');
    expect(parsed.meetPostalCode).toBe('12345');
    expect(parsed.meetCountry).toBe('USA');
    expect(parsed.meetCode).toBe(MeetTypeCode.INVITATIONAL);
    expect(parsed.meetStartDate).toEqual(new Date(Date.UTC(2024, 2, 15)));
    expect(parsed.meetEndDate).toEqual(new Date(Date.UTC(2024, 2, 17)));
    expect(parsed.poolAltitudeFeet).toBe(1000);
    expect(parsed.meetCourse).toBe(CourseStatusCode.SHORT_YARDS);
  });

  it('should validate required fields', () => {
    const record = new MeetRecord({
      // Only include mandatory V1 fields
      meetName: 'Fast Swimming Championships',
      meetStartDate: new Date(Date.UTC(2024, 3, 15)),
    });

    const validation = record.validate({ treatM2AsOptional: true });
    expect(validation.isValid).toBe(true);
  });

  it('should handle optional fields', () => {
    const record = new MeetRecord({
      meetName: 'Fast Swimming Championships',
      meetStartDate: new Date(Date.UTC(2024, 3, 15)),
      // Include some optional fields
      meetAddress1: '123 Pool Lane',
      meetPostalCode: '12345',
    });

    const validation = record.validate({ treatM2AsOptional: true });
    expect(validation.isValid).toBe(true);
  });
});
