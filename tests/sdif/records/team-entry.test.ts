import { describe, expect, it } from 'vitest';

import { TeamEntryRecord } from '../../../src/sdif/records/team-entry';
import { OrganizationCode } from '../../../src/sdif/codes';

describe('TeamEntryRecord', () => {
  // Sample data matching the known good record
  const sampleData = {
    organization: OrganizationCode.USS,
    teamCode: 'FAST01',
    coachName: 'John Smith',
    coachPhone: '123-456-7890',
    nEntries: 150,
    nAthletes: 75,
    nRelayEntries: 25,
    nRelayNameEntries: 100,
    nSplitRecords: 450,
    shortName: 'FAST',
    teamCode5: 'A',
  };

  // This is a known good C2 record
  const knownGoodRecord = [
    'C2', // Identifier (2)
    '1', // Organization (1)
    ' '.repeat(8), // Future Use (8)
    'FAST01', // Team Code (6)
    'John Smith'.padEnd(30), // Coach Name (30)
    '123-456-7890'.padEnd(12), // Coach Phone (12)
    '   150', // Number of Entries (6)
    '    75', // Number of Athletes (6)
    '   25', // Number of Relay Entries (5)
    '   100', // Number of Relay Name Entries (6)
    '   450', // Number of Split Records (6)
    'FAST'.padEnd(16), // Short Name (16)
    ' '.repeat(45), // Future Use (44)
    'A', // Team Code 5 (1)
    ' '.repeat(10), // Future Use (9)
  ].join('');

  it('should create a record matching the known good record', () => {
    const record = new TeamEntryRecord(sampleData);
    const formatted = record.toRecord();

    // The actual test
    expect(formatted).toBe(knownGoodRecord);
    expect(formatted.length).toBe(160);
  });

  it('should parse a known good record correctly', () => {
    const parsed = TeamEntryRecord.fromRecord(knownGoodRecord);

    expect(parsed.organization).toBe(OrganizationCode.USS);
    expect(parsed.teamCode).toBe('FAST01');
    expect(parsed.coachName).toBe('John Smith');
    expect(parsed.coachPhone).toBe('123-456-7890');
    expect(parsed.nEntries).toBe(150);
    expect(parsed.nAthletes).toBe(75);
    expect(parsed.nRelayEntries).toBe(25);
    expect(parsed.nRelayNameEntries).toBe(100);
    expect(parsed.nSplitRecords).toBe(450);
    expect(parsed.shortName).toBe('FAST');
    expect(parsed.teamCode5).toBe('A');
  });

  it('should validate required fields', () => {
    const record = new TeamEntryRecord({
      // All fields are optional when treatM2AsOptional is true
    });

    const validation = record.validate({ treatM2AsOptional: true });
    expect(validation.isValid).toBe(true);
  });

  it('should validate M2 fields when treatM2AsOptional is false', () => {
    const record = new TeamEntryRecord({
      // Missing M2 fields
    });

    const validation = record.validate({ treatM2AsOptional: false });
    expect(validation.isValid).toBe(false);

    const missingFields = validation.errors.map((e) => e.field);
    expect(missingFields).toContain('organization');
    expect(missingFields).toContain('teamCode');
    expect(missingFields).toContain('coachName');
  });

  it('serializes nRelayNameEntries right-justified at positions 77-82', () => {
    const record = new TeamEntryRecord({ nRelayNameEntries: 42 });
    const line = record.toRecord();
    expect(line.substring(76, 82)).toBe('    42');
    expect(TeamEntryRecord.fromRecord(line).nRelayNameEntries).toBe(42);
  });

  it('should handle optional fields', () => {
    const record = new TeamEntryRecord({
      organization: OrganizationCode.USS,
      teamCode: 'FAST01',
      coachName: 'John Smith',
      // Include some optional fields
      shortName: 'FAST',
      nAthletes: 75,
    });

    const validation = record.validate({ treatM2AsOptional: true });
    expect(validation.isValid).toBe(true);
  });
});
