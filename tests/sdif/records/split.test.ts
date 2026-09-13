import { describe, expect, test } from 'vitest';

import { SplitRecord } from '../../../src/sdif/records/split';
import { OrganizationCode, PrelimsFinalsCode, SplitCode } from '../../../src/sdif/codes';
import { SwimTime } from '../../../src/core/swimtime';

describe('SplitRecord', () => {
  const sampleData = {
    organization: OrganizationCode.USS,
    name: 'DOE, JOHN A',
    ussn: '123456789012',
    sequence: 1,
    nSplits: 4,
    splitDistance: 50,
    splitCode: SplitCode.CUMULATIVE,
    splitTime1: SwimTime.fromString('0:28.50'),
    splitTime2: SwimTime.fromString('0:59.32'),
    splitTime3: SwimTime.fromString('1:30.15'),
    splitTime4: SwimTime.fromString('2:01.45'),
    prelimsFinals: PrelimsFinalsCode.FINALS,
  };

  // Known good record should be exactly 160 characters
  const knownGoodRecord = [
    'G0', // Identifier (2)
    '1', // Organization (1)
    ' '.repeat(12), // Future Use (12)
    'DOE, JOHN A'.padEnd(28), // Name (28)
    '123456789012', // USS Number (12)
    '1', // Sequence (1)
    ' 4', // N Splits (2)
    '  50', // Split Distance (4)
    'C', // Split Code (1)
    '   28.50', // Split Time 1 (8)
    '   59.32', // Split Time 2 (8)
    ' 1:30.15', // Split Time 3 (8)
    ' 2:01.45', // Split Time 4 (8)
    ' '.repeat(48), // Split Times 5-10 (48)
    'F', // Prelims/Finals (1)
    ' '.repeat(16), // Future Use (16)
  ].join('');

  test('creates a record that matches known good record', () => {
    const record = new SplitRecord(sampleData);
    const formatted = record.toRecord();

    expect(formatted).toEqual(knownGoodRecord);
    expect(formatted.length).toBe(160);
  });

  test('parses a known good record', () => {
    const parsed = SplitRecord.fromRecord(knownGoodRecord);

    expect(parsed.organization).toBe(OrganizationCode.USS);
    expect(parsed.name).toBe('DOE, JOHN A');
    expect(parsed.ussn).toBe('123456789012');
    expect(parsed.sequence).toBe(1);
    expect(parsed.nSplits).toBe(4);
    expect(parsed.splitDistance).toBe(50);
    expect(parsed.splitCode).toBe(SplitCode.CUMULATIVE);
    expect(parsed.splitTime1?.format()).toBe('   28.50');
    expect(parsed.splitTime2?.format()).toBe('   59.32');
    expect(parsed.splitTime3?.format()).toBe(' 1:30.15');
    expect(parsed.splitTime4?.format()).toBe(' 2:01.45');
    expect(parsed.prelimsFinals).toBe(PrelimsFinalsCode.FINALS);
  });

  test('serializes prelimsFinals at position 144', () => {
    const record = new SplitRecord({ ...sampleData, prelimsFinals: PrelimsFinalsCode.PRELIMS });
    const line = record.toRecord();
    expect(line[143]).toBe('P');
    expect(SplitRecord.fromRecord(line).prelimsFinals).toBe(PrelimsFinalsCode.PRELIMS);
  });

  test('validates required fields', () => {
    const record = new SplitRecord();
    const result = record.validate({ treatM2AsOptional: true });
    expect(result.isValid).toBe(false);

    const missingFields = result.errors.map((e) => e.field);
    expect(missingFields).toContain('name');
    expect(missingFields).toContain('sequence');
    expect(missingFields).toContain('nSplits');
    expect(missingFields).toContain('splitDistance');
    expect(missingFields).toContain('splitCode');
  });

  test('handles optional fields', () => {
    const minimalData = {
      name: 'DOE, JOHN A',
      sequence: 1,
      nSplits: 0,
      splitDistance: 50,
      splitCode: SplitCode.CUMULATIVE,
    };

    const record = new SplitRecord(minimalData);
    const result = record.validate({ treatM2AsOptional: true });
    expect(result.isValid).toBe(true);
  });
});
