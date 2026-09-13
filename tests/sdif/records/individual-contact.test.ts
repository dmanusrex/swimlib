import { describe, expect, it } from 'vitest';

import { IndividualContactRecord } from '../../../src/sdif/records/individual-contact';
import { OrganizationCode, SeasonCode } from '../../../src/sdif/codes';

describe('IndividualContactRecord', () => {
  // Sample data matching the known good record
  const sampleData = {
    organization: OrganizationCode.USS,
    teamCode: 'FAST01',
    teamCode5: 'A',
    name: 'DOE, JOHN A',
    alternateMailingName: 'DOE FAMILY',
    mailingAddress: '456 Backstroke Blvd',
    mailingCity: 'Swimville',
    mailingState: 'CA',
    mailingCountry: 'USA',
    postalCode: '12345',
    countryCode: 'USA',
    region: '3',
    answerCode: 'N',
    seasonCode: SeasonCode.YEAR_ROUND,
  };

  // This is a known good D2 record per the SDIF v3 specification
  const knownGoodRecord = [
    'D2', // Identifier (2)
    '1', // Organization (1)
    ' '.repeat(8), // Future Use (8)
    'FAST01', // Team Code (6)
    'A', // Team Code 5th char (1)
    'DOE, JOHN A'.padEnd(28), // Swimmer Name (28)
    'DOE FAMILY'.padEnd(30), // Alternate Mailing Name (30)
    '456 Backstroke Blvd'.padEnd(30), // Mailing Address (30)
    'Swimville'.padEnd(20), // Mailing City (20)
    'CA', // Mailing State (2)
    'USA'.padEnd(12), // Mailing Country (12)
    '12345'.padEnd(10), // Postal Code (10)
    'USA', // Country Code (3)
    '3', // Region (1)
    'N', // Answer Code (1)
    'N', // Season Code (1)
    ' '.repeat(4), // Future Use (4)
  ].join('');

  it('should create a record matching the known good record', () => {
    const record = new IndividualContactRecord(sampleData);
    const formatted = record.toRecord();

    expect(formatted).toBe(knownGoodRecord);
    expect(formatted.length).toBe(160);
  });

  it('should parse a known good record correctly', () => {
    const parsed = IndividualContactRecord.fromRecord(knownGoodRecord);

    expect(parsed.organization).toBe(OrganizationCode.USS);
    expect(parsed.teamCode).toBe('FAST01');
    expect(parsed.teamCode5).toBe('A');
    expect(parsed.name).toBe('DOE, JOHN A');
    expect(parsed.alternateMailingName).toBe('DOE FAMILY');
    expect(parsed.mailingAddress).toBe('456 Backstroke Blvd');
    expect(parsed.mailingCity).toBe('Swimville');
    expect(parsed.mailingState).toBe('CA');
    expect(parsed.mailingCountry).toBe('USA');
    expect(parsed.postalCode).toBe('12345');
    expect(parsed.countryCode).toBe('USA');
    expect(parsed.region).toBe('3');
    expect(parsed.answerCode).toBe('N');
    expect(parsed.seasonCode).toBe(SeasonCode.YEAR_ROUND);
  });

  it('should validate required fields', () => {
    const record = new IndividualContactRecord({});

    // name is M1 — always required
    const relaxed = record.validate({ treatM2AsOptional: true });
    expect(relaxed.isValid).toBe(false);
    expect(relaxed.errors.map((e) => e.field)).toContain('name');

    // organization is M2 on top of that
    const strict = record.validate({ treatM2AsOptional: false });
    expect(strict.errors.map((e) => e.field)).toContain('organization');
  });

  it('should handle optional fields', () => {
    const record = new IndividualContactRecord({
      organization: OrganizationCode.USS,
      name: 'DOE, JOHN A',
      mailingCity: 'Swimville',
      seasonCode: SeasonCode.SEASON_1,
    });

    const validation = record.validate();
    expect(validation.isValid).toBe(true);
  });
});
