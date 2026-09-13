import { describe, expect, it } from 'vitest';

import { MeetHostRecord } from '../../../src/sdif/records/meet-host';
import { OrganizationCode } from '../../../src/sdif/codes';

describe('MeetHostRecord', () => {
  // Sample data matching the known good record
  const sampleData = {
    organization: OrganizationCode.USS,
    hostName: 'Swimville Aquatic Club',
    hostAddress1: '123 Pool Lane',
    hostAddress2: 'Suite 100',
    hostCity: 'Swimville',
    hostState: 'CA',
    hostPostalCode: '12345',
    hostCountry: 'USA',
    hostPhone: '123-456-7890',
  };

  // This is a known good B2 record per the SDIF v3 specification
  const knownGoodRecord = [
    'B2', // Identifier (2)
    '1', // Organization (1)
    ' '.repeat(8), // Future Use (8)
    'Swimville Aquatic Club'.padEnd(30), // Host Name (30)
    '123 Pool Lane'.padEnd(22), // Address 1 (22)
    'Suite 100'.padEnd(22), // Address 2 (22)
    'Swimville'.padEnd(20), // City (20)
    'CA', // State (2)
    '12345'.padEnd(10), // Postal Code (10)
    'USA', // Country (3)
    '123-456-7890', // Phone (12)
    ' '.repeat(28), // Future Use (28)
  ].join('');

  it('should create a record matching the known good record', () => {
    const record = new MeetHostRecord(sampleData);
    const formatted = record.toRecord();

    expect(formatted).toBe(knownGoodRecord);
    expect(formatted.length).toBe(160);
  });

  it('should parse a known good record correctly', () => {
    const parsed = MeetHostRecord.fromRecord(knownGoodRecord);

    expect(parsed.organization).toBe(OrganizationCode.USS);
    expect(parsed.hostName).toBe('Swimville Aquatic Club');
    expect(parsed.hostAddress1).toBe('123 Pool Lane');
    expect(parsed.hostAddress2).toBe('Suite 100');
    expect(parsed.hostCity).toBe('Swimville');
    expect(parsed.hostState).toBe('CA');
    expect(parsed.hostPostalCode).toBe('12345');
    expect(parsed.hostCountry).toBe('USA');
    expect(parsed.hostPhone).toBe('123-456-7890');
  });

  it('should validate required fields', () => {
    // organization and hostName are M2 — required unless relaxed
    const record = new MeetHostRecord({});

    const strict = record.validate({ treatM2AsOptional: false });
    expect(strict.isValid).toBe(false);
    const missingFields = strict.errors.map((e) => e.field);
    expect(missingFields).toContain('organization');
    expect(missingFields).toContain('hostName');

    const relaxed = record.validate({ treatM2AsOptional: true });
    expect(relaxed.isValid).toBe(true);
  });

  it('should handle optional fields', () => {
    const record = new MeetHostRecord({
      organization: OrganizationCode.USS,
      hostName: 'Swimville Aquatic Club',
      hostPhone: '123-456-7890',
    });

    const validation = record.validate();
    expect(validation.isValid).toBe(true);
  });
});
