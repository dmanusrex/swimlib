import { describe, expect, it } from 'vitest';

import { TeamRecord } from '../../../src/sdif/records/team';
import { TeamEntryRecord } from '../../../src/sdif/records/team-entry';
import { OrganizationCode } from '../../../src/sdif/codes';

describe('Team Records', () => {
  describe('TeamRecord', () => {
    // Sample data matching the known good record
    const sampleData = {
      organization: OrganizationCode.USS,
      teamCode: 'FAST01',
      name: 'Fast Swimming Team',
      abbreviation: 'FAST',
      address1: '123 Pool Lane',
      address2: 'Suite 100',
      city: 'Swimville',
      state: 'CA',
      postalCode: '12345',
      country: 'USA',
      region: '1',
      teamCode5: 'A',
    };

    // This is a known good C1 record
    const knownGoodRecord = [
      'C1', // Identifier (2)
      '1', // Organization (1)
      ' '.repeat(8), // Future Use (8)
      'FAST01', // Team Code (6)
      'Fast Swimming Team'.padEnd(30), // Name (30)
      'FAST'.padEnd(16), // Abbreviation (16)
      '123 Pool Lane'.padEnd(22), // Address 1 (22)
      'Suite 100'.padEnd(22), // Address 2 (22)
      'Swimville'.padEnd(20), // City (20)
      'CA', // State (2)
      '12345'.padEnd(10), // Postal Code (10)
      'USA', // Country (3)
      '1', // Region (1)
      ' '.repeat(6), // Future Use (6)
      'A', // Team Code 5 (1)
      ' '.repeat(10), // Future Use (9)
    ].join('');

    it('should create a record matching the known good record', () => {
      const record = new TeamRecord(sampleData);
      const formatted = record.toRecord();

      // The actual test
      expect(formatted).toBe(knownGoodRecord);
      expect(formatted.length).toBe(160);
    });

    it('should parse a known good record correctly', () => {
      const parsed = TeamRecord.fromRecord(knownGoodRecord);

      expect(parsed.organization).toBe(OrganizationCode.USS);
      expect(parsed.teamCode).toBe('FAST01');
      expect(parsed.name).toBe('Fast Swimming Team');
      expect(parsed.abbreviation).toBe('FAST');
      expect(parsed.address1).toBe('123 Pool Lane');
      expect(parsed.address2).toBe('Suite 100');
      expect(parsed.city).toBe('Swimville');
      expect(parsed.state).toBe('CA');
      expect(parsed.postalCode).toBe('12345');
      expect(parsed.country).toBe('USA');
      expect(parsed.region).toBe('1');
      expect(parsed.teamCode5).toBe('A');
    });

    it('should validate required fields', () => {
      const record = new TeamRecord({
        // Only include mandatory V1 fields
        teamCode: 'FAST01',
        name: 'Fast Swimming Team',
      });

      const validation = record.validate({ treatM2AsOptional: true });
      expect(validation.isValid).toBe(true);
    });

    it('should handle optional fields', () => {
      const record = new TeamRecord({
        teamCode: 'FAST01',
        name: 'Fast Swimming Team',
        // Include some optional fields
        abbreviation: 'FAST',
        address1: '123 Pool Lane',
        postalCode: '12345',
      });

      const validation = record.validate({ treatM2AsOptional: true });
      expect(validation.isValid).toBe(true);
    });
  });

  describe('TeamEntryRecord', () => {
    // Sample data matching the known good record
    const sampleData = {
      organization: OrganizationCode.USS,
      teamCode: 'FAST',
      coachName: 'John Smith',
      coachPhone: '123-456-7890',
      nEntries: 75,
      nAthletes: 25,
      nRelayEntries: 8,
      nSplitRecords: 150,
      shortName: 'FAST',
      teamCode5: 'A',
    };

    // Known good record string
    const knownGoodRecord = [
      'C2', // Identifier (2)
      '1', // Organization (1)
      ' '.repeat(8), // Future use (8)
      'FAST  ', // Team Code (6)
      'John Smith'.padEnd(30), // Coach Name (30)
      '123-456-7890'.padEnd(12), // Coach Phone (12)
      '    75', // Number of Entries (6)
      '    25', // Number of Athletes (6)
      '    8', // Number of Relay Entries (5)
      ' '.repeat(6), // Future Use (6)
      '   150', // Number of Split Records (6)
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
      expect(parsed.teamCode).toBe('FAST');
      expect(parsed.nAthletes).toBe(25);
      expect(parsed.nEntries).toBe(75);
      expect(parsed.nRelayEntries).toBe(8);
      expect(parsed.coachName).toBe('John Smith');
      expect(parsed.coachPhone).toBe('123-456-7890');
    });

    it('should validate required fields', () => {
      const record = new TeamEntryRecord({
        // Missing required fields
        nAthletes: 25,
        coachName: 'John Smith',
      });

      const validation = record.validate();
      expect(validation.isValid).toBe(false);

      // Check specific required fields
      const missingFields = validation.errors.map((e) => e.field);
      expect(missingFields).toContain('organization');
      expect(missingFields).toContain('teamCode');
    });

    it('should handle optional fields', () => {
      const record = new TeamEntryRecord({
        organization: OrganizationCode.USS,
        teamCode: 'FAST',
        nAthletes: 25,
      });

      const validation = record.validate({ treatM2AsOptional: true });
      expect(validation.isValid).toBe(true);
    });
  });

  it('should maintain referential integrity between C1 and C2 records', () => {
    // Create a C1 record
    const teamRecord = new TeamRecord({
      organization: OrganizationCode.USS,
      teamCode: 'FAST',
      name: 'Fast Swimming Team',
      abbreviation: 'FAST',
      state: 'CA',
      teamCode5: 'A',
    });

    // Create a C2 record referencing the same team
    const entryRecord = new TeamEntryRecord({
      organization: OrganizationCode.USS,
      teamCode: 'FAST',
      nAthletes: 25,
    });

    // Verify the team codes match
    expect(entryRecord.teamCode).toBe(teamRecord.teamCode);
    expect(entryRecord.organization).toBe(teamRecord.organization);
  });
});
