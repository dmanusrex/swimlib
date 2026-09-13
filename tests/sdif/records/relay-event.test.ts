import { describe, expect, it } from 'vitest';

import { RelayEventRecord } from '../../../src/sdif/records/relay-event';
import {
  OrganizationCode,
  EventSexCode,
  StrokeCode,
  CourseStatusCode,
} from '../../../src/sdif/codes';
import type { FieldError } from '../../../src/sdif/fields';
import { SwimTime } from '../../../src/core/swimtime';

describe('RelayEventRecord', () => {
  // Sample data matching the known good record
  const sampleData = {
    organization: OrganizationCode.USS,
    teamCode: 'WAC',
    relayTeamName: 'A',
    nF0Records: 4,
    eventSex: EventSexCode.FEMALE,
    relayDistance: 200,
    stroke: StrokeCode.MEDLEY_RELAY,
    eventNumber: '301',
    eventAge: '15OV',
    swimDate: new Date(Date.UTC(2024, 2, 15)), // March 15, 2024
    seedTime: SwimTime.fromString('1:58.05'),
    seedCourse: CourseStatusCode.SHORT_YARDS,
    prelimPlace: 63,
  };

  // This is a known good E0 record
  const knownGoodRecord = [
    'E0', // Identifier (2)
    '1', // Organization (1)
    ' '.repeat(8), // Future use (8)
    'A', // Relay team name (1)
    'WAC   ', // Team Code (6)
    ' 4', // Number of F0 records (2)
    'F', // Event Sex (1)
    ' 200', // Event Distance (4)
    '7', // Stroke (1)
    '301 ', // Event Number (4)
    '15OV', // Event Age (4)
    '   ', // Total athlete age (3)
    '03152024', // Date of Swim (8)
    ' 1:58.05', // Seed Time (8)
    'Y', // Seed Course (1)
    ' '.repeat(8), // Prelim Time (8)
    ' ', // Prelim Course (1)
    ' '.repeat(8), // Swim-off Time (8)
    ' ', // Swim-off Course (1)
    ' '.repeat(8), // Finals Time (8)
    ' ', // Finals Course (1)
    '  ', // Prelim Heat (2)
    '  ', // Prelim Lane (2)
    '  ', // Finals Heat (2)
    '  ', // Finals Lane (2)
    ' 63', // Prelim Place (3)
    '   ', // Finals Place (3)
    '    ', // Points Scored (4)
    '  ', // Event Time Class (2)
    ' '.repeat(59), // Future use (59)
  ].join('');

  it('should create a record matching the known good record', () => {
    const record = new RelayEventRecord(sampleData);
    const formatted = record.toRecord();

    // The actual test
    expect(formatted).toBe(knownGoodRecord);
    expect(formatted.length).toBe(160);
  });

  it('should parse a known good record correctly', () => {
    const parsed = RelayEventRecord.fromRecord(knownGoodRecord);

    expect(parsed.organization).toBe(OrganizationCode.USS);
    expect(parsed.teamCode).toBe('WAC');
    expect(parsed.relayTeamName).toBe('A');
    expect(parsed.nF0Records).toBe(4);
    expect(parsed.eventSex).toBe(EventSexCode.FEMALE);
    expect(parsed.relayDistance).toBe(200);
    expect(parsed.stroke).toBe(StrokeCode.MEDLEY_RELAY);
    expect(parsed.eventNumber).toBe('301');
    expect(parsed.eventAge).toBe('15OV');
    expect(parsed.swimDate).toEqual(new Date(Date.UTC(2024, 2, 15)));
    expect(parsed.seedTime).toEqual(SwimTime.fromString('1:58.05'));
    expect(parsed.seedCourse).toBe(CourseStatusCode.SHORT_YARDS);
    expect(parsed.prelimPlace).toBe(63);
  });

  it('should validate required fields', () => {
    const record = new RelayEventRecord({
      // Missing required fields
      relayTeamName: 'A',
      eventNumber: '47',
    });

    const validation = record.validate({ treatM2AsOptional: true });
    expect(validation.isValid).toBe(false);

    // Check specific required fields
    const missingFields = validation.errors.map((e: FieldError) => e.field);
    expect(missingFields).toContain('teamCode');
    expect(missingFields).toContain('eventSex');
    expect(missingFields).toContain('relayDistance');
    expect(missingFields).toContain('stroke');
    expect(missingFields).toContain('eventAge');
  });

  it('should handle optional fields', () => {
    const record = new RelayEventRecord({
      // Include Mandatory V1 fields
      relayTeamName: 'A',
      teamCode: 'WAC',
      eventSex: EventSexCode.FEMALE,
      relayDistance: 200,
      stroke: StrokeCode.MEDLEY_RELAY,
      eventNumber: '47',
      eventAge: '15OV',
      // Include Optional fields
      swimDate: new Date(Date.UTC(2024, 2, 15)),
      seedTime: SwimTime.fromString('1:58.05'),
      seedCourse: CourseStatusCode.SHORT_YARDS,
    });

    const validation = record.validate({ treatM2AsOptional: true });
    expect(validation.isValid).toBe(true);
  });
});
