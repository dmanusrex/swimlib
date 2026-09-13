import { describe, expect, it } from 'vitest';
import { SwimTime } from '../../src/core/swimtime';
import {
  buildSdif,
  FileCode,
  FileDescription,
  FileTerminatorRecord,
  IndividualEventRecord,
  MeetRecord,
  MeetTypeCode,
  OrganizationCode,
  parseCl2,
  parseSdif,
  RECORD_LENGTH,
  SdifBuildError,
  SexCode,
  StrokeCode,
  TeamRecord,
} from '../../src/sdif/index';

/** Build a small synthetic meet-results file used across the e2e tests. */
function syntheticRecords() {
  return [
    new FileDescription({
      organization: OrganizationCode.USS,
      sdifVersion: 'V3',
      fileCode: FileCode.MEET_RESULTS,
      softwareName: 'SwimLib',
      softwareVersion: '0.0.0',
      contactName: 'Test Contact',
      contactPhone: '555-555-5555',
      fileCreation: new Date(Date.UTC(2026, 5, 1)),
    }),
    new MeetRecord({
      organization: OrganizationCode.USS,
      meetName: 'SwimLib Invitational',
      meetCity: 'Toronto',
      meetState: 'ON',
      meetCode: MeetTypeCode.INVITATIONAL,
      meetStartDate: new Date(Date.UTC(2026, 5, 5)),
      meetEndDate: new Date(Date.UTC(2026, 5, 7)),
    }),
    new TeamRecord({
      organization: OrganizationCode.USS,
      teamCode: 'ESWIM',
      name: 'Etobicoke Swimming',
    }),
    new IndividualEventRecord({
      organization: OrganizationCode.USS,
      name: 'Swimmer, Test A',
      ussn: '123456789012',
      birthdate: new Date(Date.UTC(2010, 2, 15)),
      sex: SexCode.FEMALE,
      eventDistance: 100,
      stroke: StrokeCode.FREESTYLE,
      eventNumber: '12',
      seedTime: SwimTime.fromString('1:02.34'),
      finalsTime: SwimTime.fromString('1:01.87'),
    }),
  ];
}

describe('sdif end-to-end', () => {
  it('builds a file with 160-char lines and an auto-appended Z0', () => {
    const content = buildSdif(syntheticRecords());
    const lines = content.split('\r\n').filter((l) => l !== '');
    expect(lines.length).toBe(5);
    for (const line of lines) {
      expect(line.length).toBe(RECORD_LENGTH);
    }
    expect(lines.at(-1)!.startsWith('Z0')).toBe(true);
  });

  it('round-trips build → parse → build to identical content', () => {
    const content = buildSdif(syntheticRecords());
    const parsed = parseSdif(content);
    expect(parsed.warnings).toEqual([]);
    expect(parsed.byType.meets[0]!.meetName).toBe('SwimLib Invitational');
    expect(parsed.byType.individualEvents[0]!.finalsTime!.getHundredths()).toBe(6187);
    const rebuilt = buildSdif(parsed);
    expect(rebuilt).toBe(content);
  });

  it('accepts Windows-1252 bytes as input', () => {
    const content = buildSdif(syntheticRecords());
    const bytes = new Uint8Array([...content].map((c) => c.charCodeAt(0)));
    const parsed = parseSdif(bytes);
    expect(parsed.byType.teams[0]!.teamCode).toBe('ESWIM');
  });

  it('collects unknown record types as warnings, throws in strict mode', () => {
    const content = 'Q9' + ' '.repeat(158) + '\r\n' + buildSdif(syntheticRecords());
    const parsed = parseSdif(content);
    expect(parsed.warnings.some((w) => w.code === 'unknown-record-type')).toBe(true);
    expect(() => parseSdif(content, { strict: true })).toThrow(/unknown record type/);
  });

  it('does not append Z0 when one is present', () => {
    const records = [
      ...syntheticRecords(),
      new FileTerminatorRecord({ organization: OrganizationCode.USS, fileCode: '02' }),
    ];
    const lines = buildSdif(records)
      .split('\r\n')
      .filter((l) => l !== '');
    expect(lines.filter((l) => l.startsWith('Z0')).length).toBe(1);
  });

  it('validation failure during build throws with detail', () => {
    const bad = new MeetRecord({}); // meetName is mandatory
    expect(() => buildSdif([bad])).toThrow(SdifBuildError);
    expect(() => buildSdif([bad])).toThrow(/meetName/);
  });
});

describe('cl2 relaxed parsing', () => {
  it('a record missing M2 fields fails strict SD3 parse but passes CL2 parse', () => {
    // D0 without organization/ussn/birthdate — the CL2 shape.
    const d0 = new IndividualEventRecord({
      name: 'Swimmer, CL2',
      sex: SexCode.MALE,
      eventDistance: 50,
      stroke: StrokeCode.BUTTERFLY,
    });
    const line = d0.toRecord();

    expect(() => parseSdif(line, { strict: true })).toThrow(/required/);

    const relaxed = parseCl2(line);
    expect(relaxed.warnings).toEqual([]);
    expect(relaxed.byType.individualEvents[0]!.name).toBe('Swimmer, CL2');
  });

  it('CL2 parse also turns off M1 mandatory checks', () => {
    // D0 missing even the M1 fields (name, sex).
    const d0 = new IndividualEventRecord({ eventDistance: 50, stroke: StrokeCode.BUTTERFLY });
    const line = d0.toRecord();

    expect(parseSdif(line).warnings.some((w) => w.code === 'validation-error')).toBe(true);
    expect(parseCl2(line).warnings).toEqual([]);
  });

  it('non-strict SD3 parse of CL2 content collects validation warnings', () => {
    const d0 = new IndividualEventRecord({
      name: 'Swimmer, CL2',
      sex: SexCode.MALE,
    });
    const parsed = parseSdif(d0.toRecord());
    expect(parsed.warnings.some((w) => w.code === 'validation-error')).toBe(true);
  });

  it('treatM2AsOptional demotes missing M2 fields to warnings', () => {
    const d0 = new IndividualEventRecord({
      name: 'Swimmer, CL2',
      sex: SexCode.MALE,
    });
    const parsed = parseSdif(d0.toRecord(), { treatM2AsOptional: true });
    expect(parsed.warnings.some((w) => w.code === 'validation-error')).toBe(false);
    expect(parsed.warnings.some((w) => w.code === 'validation-warning')).toBe(true);
    // Missing M2 fields never throw, even in strict mode.
    expect(() => parseSdif(d0.toRecord(), { treatM2AsOptional: true, strict: true })).not.toThrow();
  });
});
