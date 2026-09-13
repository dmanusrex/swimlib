import { describe, expect, it } from 'vitest';

import { IndividualInfoRecord } from '../../../src/sdif/records/individual-info';
import { EthnicityCode } from '../../../src/sdif/codes';

describe('IndividualInfoRecord', () => {
  // Sample data matching the known good record
  const sampleData = {
    ussNumber: '091991MICFPHE',
    preferredFirstName: 'Mike',
    ethnicity1: EthnicityCode.CAUCASIAN,
    juniorHigh: false,
    seniorHigh: true,
    ymcaYwca: false,
    college: false,
    summerLeague: false,
    masters: false,
    disabledSportsOrg: false,
    waterPolo: false,
    none: false,
  };

  // This is a known good D3 record
  const knownGoodRecord = [
    'D3', // Identifier (2)
    '091991MICFPHE'.padEnd(14, ' '), // USS number (14)
    'Mike'.padEnd(15, ' '), // Preferred first name (15)
    'S', // Ethnicity 1 (1)
    ' ', // Ethnicity 2 (1)
    'F', // Junior high (1)
    'T', // Senior high (1)
    'F', // YMCA/YWCA (1)
    'F', // College (1)
    'F', // Summer league (1)
    'F', // Masters (1)
    'F', // Disabled sports (1)
    'F', // Water polo (1)
    'F', // None (1)
    ' '.repeat(118), // Future use (118)
  ].join('');

  it('should create a record matching the known good record', () => {
    const record = new IndividualInfoRecord(sampleData);
    const formatted = record.toRecord();

    // The actual test
    expect(formatted).toBe(knownGoodRecord);
    expect(formatted.length).toBe(160);
  });

  it('should parse a known good record correctly', () => {
    const parsed = IndividualInfoRecord.fromRecord(knownGoodRecord);

    expect(parsed.ussNumber).toBe('091991MICFPHE');
    expect(parsed.preferredFirstName).toBe('Mike');
    expect(parsed.ethnicity1).toBe(EthnicityCode.CAUCASIAN);
    // Blank CODE fields parse to null (same as the old library's base parser).
    expect(parsed.ethnicity2).toBeNull();
    expect(parsed.juniorHigh).toBe(false);
    expect(parsed.seniorHigh).toBe(true);
    expect(parsed.ymcaYwca).toBe(false);
    expect(parsed.college).toBe(false);
    expect(parsed.summerLeague).toBe(false);
    expect(parsed.masters).toBe(false);
    expect(parsed.disabledSportsOrg).toBe(false);
    expect(parsed.waterPolo).toBe(false);
    expect(parsed.none).toBe(false);
  });

  it('should handle optional fields', () => {
    const record = new IndividualInfoRecord({
      ussNumber: '091991MICFPHE',
      // Omitting optional fields
    });

    const validation = record.validate({ treatM2AsOptional: true });
    expect(validation.isValid).toBe(true);
  });
});
