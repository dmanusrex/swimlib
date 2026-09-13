import { describe, expect, it } from 'vitest';

import { IndividualEventRecord } from '../../../src/sdif/records/individual';
import {
  OrganizationCode,
  SexCode,
  EventSexCode,
  StrokeCode,
  CourseStatusCode,
  AttachCode,
  TimeCode,
} from '../../../src/sdif/codes';
import { SwimTime } from '../../../src/core/swimtime';

describe('IndividualEventRecord', () => {
  // Sample data matching the known good record
  const sampleData = {
    organization: OrganizationCode.USS,
    name: 'DOE, JOHN A',
    ussn: '123456789012',
    attached: AttachCode.ATTACHED,
    citizen: 'USA',
    birthdate: new Date(Date.UTC(2008, 5, 15)), // June 15, 2008
    ageOrClass: '14',
    sex: SexCode.MALE,
    eventSex: EventSexCode.MALE,
    eventDistance: 100,
    stroke: StrokeCode.FREESTYLE,
    eventNumber: '21',
    eventAge: '1314',
    dateOfSwim: new Date(Date.UTC(2024, 2, 15)), // March 15, 2024
    seedTime: SwimTime.fromString('54.32'),
    seedCourse: CourseStatusCode.SHORT_YARDS,
    prelimTime: SwimTime.fromString('53.45'),
    prelimCourse: CourseStatusCode.SHORT_YARDS,
    prelimHeatNumber: 3,
    prelimLaneNumber: 4,
    prelimPlaceRanking: 12,
    pointsScoredFinals: 4.5,
    centipointsScoredFinals: 50,
  };

  // This is a known good D0 record
  const knownGoodRecord = [
    'D0', // Identifier (2)
    '1', // Organization (1)
    ' '.repeat(8), // Future Use (8)
    'DOE, JOHN A'.padEnd(28), // Name (28)
    '123456789012', // USS Number (12)
    'A', // Attach Code (1)
    'USA', // Citizenship (3)
    '06152008', // Birth Date (8)
    '14', // Age/Class (2)
    'M', // Sex (1)
    'M', // Event Sex (1)
    ' 100', // Event Distance (4)
    '1', // Stroke (1)
    '  21', // Event Number (4) — right-justified per Hy-Tek practice
    '1314', // Event Age (4)
    '03152024', // Date of Swim (8)
    '   54.32', // Seed Time (8)
    'Y', // Seed Course (1)
    '   53.45', // Prelim Time (8)
    'Y', // Prelim Course (1)
    ' '.repeat(8), // Swim-off Time (8)
    ' ', // Swim-off Course (1)
    ' '.repeat(8), // Finals Time (8)
    ' ', // Finals Course (1)
    ' 3', // Prelim Heat (2)
    ' 4', // Prelim Lane (2)
    '  ', // Finals Heat (2)
    '  ', // Finals Lane (2)
    ' 12', // Prelim Place (3)
    '   ', // Finals Place (3)
    ' 4.5', // Points Scored (4)
    '  ', // Event Time Class (2)
    ' ', // Flight Status (1)
    ' '.repeat(5), // Future Use (5)
    '50', // Centipoints Scored Finals (2)
    ' '.repeat(8), // Future Use (8)
  ].join('');

  it('should create a record matching the known good record', () => {
    const record = new IndividualEventRecord(sampleData);
    const formatted = record.toRecord();

    // The actual test
    expect(formatted).toBe(knownGoodRecord);
    expect(formatted.length).toBe(160);
  });

  it('should parse a known good record correctly', () => {
    const parsed = IndividualEventRecord.fromRecord(knownGoodRecord);

    expect(parsed.organization).toBe(OrganizationCode.USS);
    expect(parsed.name).toBe('DOE, JOHN A');
    expect(parsed.ussn).toBe('123456789012');
    expect(parsed.attached).toBe(AttachCode.ATTACHED);
    expect(parsed.citizen).toBe('USA');
    expect(parsed.birthdate).toEqual(new Date(Date.UTC(2008, 5, 15)));
    expect(parsed.ageOrClass).toBe('14');
    expect(parsed.sex).toBe(SexCode.MALE);
    expect(parsed.eventSex).toBe(EventSexCode.MALE);
    expect(parsed.eventDistance).toBe(100);
    expect(parsed.stroke).toBe(StrokeCode.FREESTYLE);
    expect(parsed.eventNumber).toBe('21');
    expect(parsed.eventAge).toBe('1314');
    expect(parsed.dateOfSwim).toEqual(new Date(Date.UTC(2024, 2, 15)));
    expect(parsed.seedTime?.format()).toBe('   54.32');
    expect(parsed.seedCourse).toBe(CourseStatusCode.SHORT_YARDS);
    expect(parsed.prelimTime?.format()).toBe('   53.45');
    expect(parsed.prelimCourse).toBe(CourseStatusCode.SHORT_YARDS);
    expect(parsed.prelimHeatNumber).toBe(3);
    expect(parsed.prelimLaneNumber).toBe(4);
    expect(parsed.prelimPlaceRanking).toBe(12);
    expect(parsed.pointsScoredFinals).toBe(4.5);
    expect(parsed.centipointsScoredFinals).toBe(50);
  });

  it('should handle special time codes', () => {
    const data = { ...sampleData };
    data.seedTime = SwimTime.fromCode(TimeCode.NO_TIME);
    data.prelimTime = SwimTime.fromCode(TimeCode.DISQUALIFIED);

    const record = new IndividualEventRecord(data);
    const formatted = record.toRecord();

    expect(formatted.substring(88, 96)).toBe('NT      ');
    // Prelim time occupies positions 98-105 (0-based indices 97-104).
    expect(formatted.substring(97, 105)).toBe('DQ      ');
  });

  it('should handle long names with truncation warning', () => {
    const data = { ...sampleData };
    data.name = 'VERYLONGLASTNAME, JOHNATHAN ALEXANDER';

    const record = new IndividualEventRecord(data);
    // Truncation warnings are collected while formatting, so format first.
    const formatted = record.toRecord();
    const validation = record.validate();

    expect(validation.warnings).toHaveLength(1);
    expect(validation.warnings[0]!.field).toBe('name');
    // Name field is 28 characters (positions 12-39).
    expect(formatted.substring(11, 39)).toBe('VERYLONGLASTNAME, JOHNATHAN ');
  });

  it('should validate required fields', () => {
    const record = new IndividualEventRecord({
      // Only include mandatory V1 fields
      name: 'DOE, JOHN A',
      sex: SexCode.MALE,
    });

    const validation = record.validate({ treatM2AsOptional: true });
    expect(validation.isValid).toBe(true);
  });

  it('should validate M2 fields when treatM2AsOptional is false', () => {
    const record = new IndividualEventRecord({
      name: 'DOE, JOHN A',
      sex: SexCode.MALE,
      // Missing M2 fields (ussn, birthdate)
    });

    const validation = record.validate({ treatM2AsOptional: false });
    expect(validation.isValid).toBe(false);

    const missingFields = validation.errors.map((e) => e.field);
    expect(missingFields).toContain('ussn');
    expect(missingFields).toContain('birthdate');
  });

  it('should handle optional fields', () => {
    const record = new IndividualEventRecord({
      name: 'DOE, JOHN',
      sex: SexCode.MALE,
      // Include some optional fields
      eventDistance: 100,
      stroke: StrokeCode.FREESTYLE,
      seedTime: SwimTime.fromString('54.32'),
    });

    const validation = record.validate({ treatM2AsOptional: true });
    expect(validation.isValid).toBe(true);
  });

  const sampleDataExtraLong = {
    organization: OrganizationCode.USS,
    name: 'DOE, JOHN MICHAEL EXTRA LONG NAME', // Intentionally too long
    ussn: '123456789',
    sex: SexCode.MALE,
    eventSex: EventSexCode.MALE,
    eventDistance: 100,
    stroke: StrokeCode.FREESTYLE,
    eventNumber: '21',
    eventAge: '15-16',
    seedTime: SwimTime.fromString('1:02.34'),
    seedCourse: CourseStatusCode.SHORT_YARDS,
  };

  it('should create a valid record with truncated name', () => {
    const record = new IndividualEventRecord(sampleDataExtraLong);

    // Verify the formatted record (truncation warnings are collected here)
    const formatted = record.toRecord();
    expect(formatted.length).toBe(160);

    // Should be valid but have warnings (birthdate is mandatory M2 and absent)
    const validation = record.validate({ treatM2AsOptional: true });
    expect(validation.isValid).toBe(true);
    // Missing birthdate (M2) plus truncation of both name and eventAge
    // ('15-16' in a 4-character field).
    expect(validation.warnings).toHaveLength(3);
    expect(validation.warnings.some((w) => w.field === 'birthdate')).toBe(true);
    const nameWarning = validation.warnings.find((w) => w.field === 'name');
    expect(nameWarning).toBeDefined();
    expect(nameWarning?.severity).toBe('warning');
    expect(nameWarning?.message).toContain('truncated');

    // Name should be truncated to 28 characters (positions 12-39)
    const name = formatted.substring(11, 39).trim();
    expect(name).toBe('DOE, JOHN MICHAEL EXTRA LONG');

    // Seed time should be properly formatted (positions 89-96)
    const seedTime = formatted.substring(88, 96).trim();
    expect(seedTime).toBe('1:02.34');

    // Course code should be single character without padding (position 97)
    const course = formatted.substring(96, 97);
    expect(course).toBe('Y');
  });

  it('should parse a record correctly', () => {
    const record = new IndividualEventRecord(sampleDataExtraLong);
    const formatted = record.toRecord();

    const parsed = IndividualEventRecord.fromRecord(formatted);

    expect(parsed.name).toBe('DOE, JOHN MICHAEL EXTRA LONG');
    expect(parsed.seedTime?.format().trim()).toBe('1:02.34');
    expect(parsed.seedCourse).toBe(CourseStatusCode.SHORT_YARDS);
  });

  it('should handle missing optional fields', () => {
    const minimalData = {
      name: 'DOE, JOHN',
      sex: SexCode.MALE,
      eventSex: EventSexCode.MALE,
      eventDistance: 100,
      stroke: StrokeCode.FREESTYLE,
      eventNumber: '21',
      eventAge: '15-16',
    };

    const record = new IndividualEventRecord(minimalData);
    // ussn/birthdate/organization are mandatory M2 and absent — reported as
    // warnings (not errors) with treatM2AsOptional, suppressed in cl2 mode.
    const validation = record.validate({ treatM2AsOptional: true });
    expect(validation.isValid).toBe(true);
    expect(validation.warnings.map((w) => w.field).sort()).toEqual([
      'birthdate',
      'organization',
      'ussn',
    ]);

    const cl2 = record.validate({ cl2: true });
    expect(cl2.isValid).toBe(true);
    expect(cl2.warnings).toHaveLength(0);
  });

  it('should validate required fields when empty', () => {
    const record = new IndividualEventRecord({
      // Missing required fields
    });

    const validation = record.validate();
    expect(validation.isValid).toBe(false);

    // name/sex are mandatory V1; ussn/birthdate/organization are mandatory V2.
    // Event fields (eventSex, eventDistance, stroke, eventNumber, eventAge)
    // are optional in the D0 field definitions.
    const missingFields = validation.errors.map((e) => e.field);
    expect(missingFields).toContain('name');
    expect(missingFields).toContain('sex');
    expect(missingFields).toContain('organization');
    expect(missingFields).toContain('ussn');
    expect(missingFields).toContain('birthdate');
  });

  it('should format times and codes correctly', () => {
    const data = {
      ...sampleDataExtraLong,
      prelimTime: SwimTime.fromString('59.99'),
      prelimCourse: CourseStatusCode.SHORT_METERS,
      finalsTime: SwimTime.fromString('58.88'),
      finalsCourse: CourseStatusCode.LONG_METERS,
    };

    const record = new IndividualEventRecord(data);
    const formatted = record.toRecord();

    // Check each time and course code (positions per the D0 layout)
    expect(formatted.substring(88, 96).trim()).toBe('1:02.34'); // seed time (89-96)
    expect(formatted.substring(96, 97)).toBe('Y'); // seed course (97)
    expect(formatted.substring(97, 105).trim()).toBe('59.99'); // prelim time (98-105)
    expect(formatted.substring(105, 106)).toBe('M'); // prelim course (106, SHORT_METERS)
    expect(formatted.substring(115, 123).trim()).toBe('58.88'); // finals time (116-123)
    expect(formatted.substring(123, 124)).toBe('L'); // finals course (124)
  });
});
