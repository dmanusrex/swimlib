import { describe, expect, it } from 'vitest';

import { FileDescription } from '../../../src/sdif/records/file';
import { OrganizationCode, FileCode } from '../../../src/sdif/codes';
import { ErrorSeverity } from '../../../src/sdif/fields';

describe('FileDescription', () => {
  const sampleData = {
    organization: OrganizationCode.USS,
    sdifVersion: '3.0',
    fileCode: FileCode.MEET_RESULTS,
    softwareName: 'Test Software',
    softwareVersion: '1.0',
    contactName: 'John Doe',
    contactPhone: '123-456-7890',
    fileCreation: new Date(Date.UTC(2024, 2, 15)), // March 15, 2024
    submittedByLsc: 'CA',
  };

  // This is a known good A0 record from the SDIF specification
  const knownGoodRecord = [
    'A0', // Identifier (2)
    '1', // Organization (1)
    '3.0'.padEnd(8), // SDIF Version (8)
    '02', // File Code (2)
    ' '.repeat(30), // Future Use (30)
    'Test Software'.padEnd(20), // Software Name (20)
    '1.0'.padEnd(10), // Software Version (10)
    'John Doe'.padEnd(20), // Contact Name (20)
    '123-456-7890'.padEnd(12), // Contact Phone (12)
    '03152024', // File Creation Date (8)
    ' '.repeat(42), // Future Use (42)
    'CA', // LSC (2)
    ' '.repeat(3), // Future Use (2)
  ].join('');

  it('should create a valid record', () => {
    const record = new FileDescription(sampleData);
    expect(record.validate().isValid).toBe(true);
  });

  it('should format record correctly', () => {
    const record = new FileDescription(sampleData);
    const formatted = record.toRecord();

    expect(formatted).toBe(knownGoodRecord);
    expect(formatted.length).toBe(160);
  });

  it('should parse a known good record', () => {
    const parsed = FileDescription.fromRecord(knownGoodRecord);

    expect(parsed.organization).toBe(OrganizationCode.USS);
    expect(parsed.sdifVersion).toBe('3.0');
    expect(parsed.fileCode).toBe(FileCode.MEET_RESULTS);
    expect(parsed.softwareName).toBe('Test Software');
    expect(parsed.contactName).toBe('John Doe');
    expect(parsed.contactPhone).toBe('123-456-7890');
    expect(parsed.fileCreation.toISOString()).toBe(new Date(Date.UTC(2024, 2, 15)).toISOString());
    expect(parsed.submittedByLsc).toBe('CA');
  });

  it('should validate required fields', () => {
    const record = new FileDescription({
      // Missing required fields
      sdifVersion: '3.0',
      softwareName: 'Test Software',
    });

    const validation = record.validate();
    expect(validation.isValid).toBe(false);
    expect(validation.errors).toHaveLength(5); // organization, fileCode, contactName, contactPhone, fileCreation

    // Check specific required fields
    const missingFields = validation.errors.map((e) => e.field);
    expect(missingFields).toContain('organization');
    expect(missingFields).toContain('fileCode');
    expect(missingFields).toContain('contactName');
    expect(missingFields).toContain('contactPhone');
    expect(missingFields).toContain('fileCreation');
  });

  it('should handle optional fields', () => {
    const record = new FileDescription({
      organization: OrganizationCode.USS,
      fileCode: FileCode.MEET_RESULTS,
      contactName: 'John Doe',
      contactPhone: '123-456-7890',
      fileCreation: new Date(Date.UTC(2024, 2, 15)),
    });

    const validation = record.validate();
    expect(validation.isValid).toBe(true);
  });

  it('should handle field truncation warnings', () => {
    const record = new FileDescription({
      ...sampleData,
      softwareName: 'This is a very long software name that exceeds the field length',
      contactName: 'John Jacob Jingleheimer Schmidt III',
    });

    const formatted = record.toRecord();
    const validation = record.validate();

    expect(validation.isValid).toBe(true);
    expect(validation.warnings).toHaveLength(2);

    // Verify warning messages
    const softwareWarning = validation.warnings.find((w) => w.field === 'softwareName');
    const contactWarning = validation.warnings.find((w) => w.field === 'contactName');

    expect(softwareWarning).toBeDefined();
    expect(softwareWarning?.severity).toBe(ErrorSeverity.WARNING);
    expect(softwareWarning?.message).toMatch(/truncated from \d+ to 20 characters/);

    expect(contactWarning).toBeDefined();
    expect(contactWarning?.severity).toBe(ErrorSeverity.WARNING);
    expect(contactWarning?.message).toMatch(/truncated from \d+ to 20 characters/);

    // Check truncated values in formatted record - verify exact content without trimming
    expect(formatted.substring(43, 63)).toBe('This is a very long'.padEnd(20));
    expect(formatted.substring(73, 93)).toBe('John Jacob Jinglehei'.padEnd(20));
  });

  it('should handle various phone number formats', () => {
    const testCases = [
      { input: '123-456-7890', expected: '123-456-7890'.padEnd(12) },
      { input: '+44 20 7123 4567', expected: '+44 20 7123 '.padEnd(12) }, // International UK
      { input: '+81 3-1234-5678', expected: '+81 3-1234-5'.padEnd(12) }, // International Japan
      { input: '(02) 9876 5432', expected: '(02) 9876 54'.padEnd(12) }, // Australian
      { input: '01 23 45 67 89', expected: '01 23 45 67 '.padEnd(12) }, // French
    ];

    testCases.forEach(({ input, expected }) => {
      const record = new FileDescription({
        ...sampleData,
        contactPhone: input,
      });

      const formatted = record.toRecord();
      // Compare the full field content including padding
      expect(formatted.substring(93, 105)).toBe(expected);

      // Verify we can parse it back - should get the trimmed value
      const parsed = FileDescription.fromRecord(formatted);
      expect(parsed.contactPhone).toBe(expected.trim());
    });
  });

  it('should handle date formatting edge cases', () => {
    const testCases = [
      {
        input: new Date(Date.UTC(2024, 0, 1)), // January 1, 2024
        expected: '01012024',
      },
      {
        input: new Date(Date.UTC(2024, 11, 31)), // December 31, 2024
        expected: '12312024',
      },
      {
        input: new Date(Date.UTC(2024, 8, 9)), // September 9, 2024
        expected: '09092024',
      },
    ];

    testCases.forEach(({ input, expected }) => {
      const record = new FileDescription({
        ...sampleData,
        fileCreation: input,
      });

      const formatted = record.toRecord();
      expect(formatted.substring(105, 113)).toBe(expected);
    });
  });
});
