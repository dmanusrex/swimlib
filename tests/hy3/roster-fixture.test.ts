import fs from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import { buildHy3, FileCode, parseHy3, type Hy3File } from '../../src/hy3/index';

/**
 * Round-trip validation against a real Hy-Tek TEAM MANAGER 8 roster export
 * (mock data). The file carries one of every roster record type:
 * A1('03'), C1, C2, C3, and the full D-family D1-D9/DA/DB/DD/DE/DF.
 */
const FIXTURE = new URL('../fixtures/Sample Roster.HY3', import.meta.url);

describe('hy3 TM8 roster fixture', () => {
  let original: string;
  let parsed: Hy3File;

  beforeAll(() => {
    original = fs.readFileSync(FIXTURE, 'latin1');
    parsed = parseHy3(original);
  });

  it('parses with zero warnings (all checksums verify)', () => {
    expect(parsed.warnings).toEqual([]);
  });

  it('contains exactly one record of each of the 18 roster types', () => {
    expect(parsed.records.length).toBe(18);
    const types = parsed.records.map((r) => r.identifier);
    expect(types).toEqual([
      'A1',
      'C1',
      'C2',
      'C3',
      'D1',
      'D2',
      'D3',
      'D4',
      'D5',
      'D6',
      'D7',
      'D8',
      'D9',
      'DA',
      'DB',
      'DD',
      'DE',
      'DF',
    ]);
  });

  it('reads the A1 file description', () => {
    const a1 = parsed.byType.fileDescriptions[0]!;
    expect(a1.fileCode).toBe(FileCode.TEAM_ROSTER); // '03'
    expect(a1.fileDescription).toBe('Rosters Only');
    expect(a1.softwareVendor).toBe('Hy-Tek, Ltd');
    expect(a1.softwareName).toBe('Win-TM 8.0Ee');
    expect(a1.creationTime).toBe('3:23 PM'); // right-justified on disk
  });

  it('reads the C1 team record including the coach columns', () => {
    const c1 = parsed.byType.teams[0]!;
    expect(c1.teamCode).toBe('TEST');
    expect(c1.name).toBe('Test Team Full Name');
    expect(c1.abbreviation).toBe('Test Team Short');
    expect(c1.lsc).toBe('ON');
    expect(c1.headCoachName).toBe('First Coach 1');
    expect(c1.teamType).toBe('AGE');
  });

  it('reads D-family spot checks (mock swimmer)', () => {
    const d1 = parsed.byType.individualInfos[0]!;
    expect(d1.swimmerGender).toBe('M');
    expect(d1.swimmerId).toBe('1');
    expect(d1.swimmerLastName).toBe('Ath1');
    expect(d1.swimmerFirstName).toBe('AthFirst');
    expect(d1.ussNumber).toBe('ID123456789');
    expect(d1.swimmerBirthDate).toEqual(new Date(Date.UTC(2015, 8, 1)));
    expect(d1.swimmerAge).toBe(10);
    expect(d1.inactive).toBe('*');
    expect(d1.registrationCountry).toBe('ALB');

    expect(parsed.byType.medicalConditions[0]!.description).toBe('A medical condition');
    expect(parsed.byType.guardianNames[0]!.fatherFirstName).toBe('father');
    expect(parsed.byType.swimmerContacts[0]!.email).toBe('athlete@example.com');
  });

  it('rebuilds the original file byte-for-byte', () => {
    expect(buildHy3(parsed.records)).toBe(original);
  });
});
