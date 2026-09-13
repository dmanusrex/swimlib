import { describe, expect, it } from 'vitest';

import { IndividualAdminRecord } from '../../../src/sdif/records/individual-admin';
import { AttachCode, MemberCode, OrganizationCode, SexCode } from '../../../src/sdif/codes';

describe('IndividualAdminRecord', () => {
  // Sample data matching the known good record
  const sampleData = {
    organization: OrganizationCode.USS,
    teamCode: 'FAST01',
    teamCode5: 'A',
    name: 'DOE, JOHN A',
    ussn: '123456789012',
    attached: AttachCode.ATTACHED,
    citizen: 'USA',
    birthdate: new Date(Date.UTC(2010, 2, 15)), // March 15, 2010
    ageOrClass: '14',
    sex: SexCode.MALE,
    adminInfo1: 'ADMIN INFO ONE',
    adminInfo4: 'OLD MEMBER NUMBER',
    phone1: '123-456-7890',
    phone2: '098-765-4321',
    ussRegistrationDate: new Date(Date.UTC(2024, 8, 1)), // September 1, 2024
    memberCode: MemberCode.RENEW,
  };

  // This is a known good D1 record per the SDIF v3 specification
  const knownGoodRecord = [
    'D1', // Identifier (2)
    '1', // Organization (1)
    ' '.repeat(8), // Future Use (8)
    'FAST01', // Team Code (6)
    'A', // Team Code 5th char (1)
    'DOE, JOHN A'.padEnd(28), // Swimmer Name (28)
    ' ', // Future Use (1)
    '123456789012', // USS Number (12)
    'A', // Attached (1)
    'USA', // Citizen (3)
    '03152010', // Birthdate (8)
    '14', // Age or Class (2)
    'M', // Sex (1)
    'ADMIN INFO ONE'.padEnd(30), // First Admin Info (30)
    'OLD MEMBER NUMBER'.padEnd(20), // Fourth Admin Info (20)
    '123-456-7890', // Phone 1 (12)
    '098-765-4321', // Phone 2 (12)
    '09012024', // USS Registration Date (8)
    'R', // Member Code (1)
    ' '.repeat(3), // Future Use (3)
  ].join('');

  it('should create a record matching the known good record', () => {
    const record = new IndividualAdminRecord(sampleData);
    const formatted = record.toRecord();

    expect(formatted).toBe(knownGoodRecord);
    expect(formatted.length).toBe(160);
  });

  it('should parse a known good record correctly', () => {
    const parsed = IndividualAdminRecord.fromRecord(knownGoodRecord);

    expect(parsed.organization).toBe(OrganizationCode.USS);
    expect(parsed.teamCode).toBe('FAST01');
    expect(parsed.teamCode5).toBe('A');
    expect(parsed.name).toBe('DOE, JOHN A');
    expect(parsed.ussn).toBe('123456789012');
    expect(parsed.attached).toBe(AttachCode.ATTACHED);
    expect(parsed.citizen).toBe('USA');
    expect(parsed.birthdate).toEqual(new Date(Date.UTC(2010, 2, 15)));
    expect(parsed.ageOrClass).toBe('14');
    expect(parsed.sex).toBe(SexCode.MALE);
    expect(parsed.adminInfo1).toBe('ADMIN INFO ONE');
    expect(parsed.adminInfo4).toBe('OLD MEMBER NUMBER');
    expect(parsed.phone1).toBe('123-456-7890');
    expect(parsed.phone2).toBe('098-765-4321');
    expect(parsed.ussRegistrationDate).toEqual(new Date(Date.UTC(2024, 8, 1)));
    expect(parsed.memberCode).toBe(MemberCode.RENEW);
  });

  it('should validate required fields', () => {
    const record = new IndividualAdminRecord({});

    // name and sex are M1 — always required
    const relaxed = record.validate({ treatM2AsOptional: true });
    expect(relaxed.isValid).toBe(false);
    const missingM1 = relaxed.errors.map((e) => e.field);
    expect(missingM1).toContain('name');
    expect(missingM1).toContain('sex');

    // organization, ussn and birthdate are M2 on top of that
    const strict = record.validate({ treatM2AsOptional: false });
    const missingFields = strict.errors.map((e) => e.field);
    expect(missingFields).toContain('organization');
    expect(missingFields).toContain('ussn');
    expect(missingFields).toContain('birthdate');
  });

  it('should handle optional fields', () => {
    const record = new IndividualAdminRecord({
      name: 'DOE, JOHN A',
      sex: SexCode.MALE,
      phone1: '123-456-7890',
    });

    const validation = record.validate({ treatM2AsOptional: true });
    expect(validation.isValid).toBe(true);
  });
});
