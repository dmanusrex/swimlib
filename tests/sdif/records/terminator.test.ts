import { describe, expect, it } from 'vitest';

import { FileTerminatorRecord } from '../../../src/sdif/records/terminator';
import { OrganizationCode, FileCode } from '../../../src/sdif/codes';

describe('FileTerminatorRecord', () => {
  // Sample data matching the known good record
  const sampleData = {
    organization: OrganizationCode.USS,
    fileCode: FileCode.MEET_RESULTS,
    notes: 'Test Meet Results File',
    numBRecords: 123,
    numMeets: 2,
    numCRecords: 456,
    numTeams: 15,
    numDRecords: 789,
    numSwimmers: 150,
    numERecords: 234,
    numFRecords: 567,
    numGRecords: 890,
    batchNumber: 1,
    numNewMembers: 45,
    numRenewMembers: 67,
    numMemberChanges: 12,
    numMemberDeletes: 3,
  };

  // This is a known good Z0 record
  const knownGoodRecord = [
    'Z0', // Identifier (2)
    '1', // Organization (1)
    ' '.repeat(8), // Future use (8)
    '02', // File Code (2)
    'Test Meet Results File'.padEnd(30), // Notes (30)
    '123', // Num B Records (3)
    '  2', // Num Meets (3)
    ' 456', // Num C Records (4)
    '  15', // Num Teams (4)
    '   789', // Num D Records (6)

    '   150', // Num Swimmers (6)
    '  234', // Num E Records (5)
    '   567', // Num F Records (6)
    '   890', // Num G Records (6)
    '    1', // Batch Number (5)
    ' 45', // Num New Members (3)
    ' 67', // Num Renew Members (3)
    ' 12', // Num Member Changes (3)
    '  3', // Num Member Deletes (3)
    ' '.repeat(57), // Future use (56)
  ].join('');

  it('should create a record matching the known good record', () => {
    const record = new FileTerminatorRecord(sampleData);
    const formatted = record.toRecord();

    // The actual test
    expect(formatted).toBe(knownGoodRecord);
    expect(formatted.length).toBe(160);
  });

  it('should parse a known good record correctly', () => {
    const parsed = FileTerminatorRecord.fromRecord(knownGoodRecord);

    expect(parsed.organization).toBe(OrganizationCode.USS);
    expect(parsed.fileCode).toBe(FileCode.MEET_RESULTS);
    expect(parsed.notes).toBe('Test Meet Results File');
    expect(parsed.numBRecords).toBe(123);
    expect(parsed.numMeets).toBe(2);
    expect(parsed.numCRecords).toBe(456);
    expect(parsed.numTeams).toBe(15);
    expect(parsed.numDRecords).toBe(789);
    expect(parsed.numSwimmers).toBe(150);
    expect(parsed.numERecords).toBe(234);
    expect(parsed.numFRecords).toBe(567);
    expect(parsed.numGRecords).toBe(890);
    expect(parsed.batchNumber).toBe(1);
    expect(parsed.numNewMembers).toBe(45);
    expect(parsed.numRenewMembers).toBe(67);
    expect(parsed.numMemberChanges).toBe(12);
    expect(parsed.numMemberDeletes).toBe(3);
  });

  it('should validate required fields', () => {
    const record = new FileTerminatorRecord({
      // Only fileCode is required
      fileCode: FileCode.MEET_RESULTS,
    });

    const validation = record.validate({ treatM2AsOptional: true });
    expect(validation.isValid).toBe(true);
  });

  it('should handle optional fields', () => {
    const record = new FileTerminatorRecord({
      fileCode: FileCode.MEET_RESULTS,
      organization: OrganizationCode.USS,
      notes: 'Test',
      numBRecords: 1,
      numMeets: 1,
      // Omitting other optional fields
    });

    const validation = record.validate();
    expect(validation.isValid).toBe(true);
  });
});
