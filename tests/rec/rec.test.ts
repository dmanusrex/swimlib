import fs from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  buildDataRecord,
  buildRec,
  parseRec,
  RECORD_SIZE,
  type RecIndividualRecord,
} from '../../src/rec/index';

const FIXTURE = new URL('../fixtures/synthetic.rec.b64', import.meta.url);

describe('rec fixture', () => {
  let sample: Uint8Array;

  beforeAll(() => {
    sample = new Uint8Array(Buffer.from(fs.readFileSync(FIXTURE, 'utf8').trim(), 'base64'));
  });

  it('fixture size is 3 * 120', () => {
    expect(sample.length).toBe(3 * RECORD_SIZE);
  });

  it('parse yields one header, one individual, and one relay', () => {
    const { header, records, warnings } = parseRec(sample);
    expect(header.recordCount).toBe(3);
    expect(header.setName).toBe('Synthetic Records');
    expect(records.length).toBe(2);
    expect(warnings).toEqual([]);
    const individual = records.filter((r) => r.typeFlag === 'I').length;
    const relay = records.filter((r) => r.typeFlag === 'R').length;
    expect(individual).toBe(1);
    expect(relay).toBe(1);
  });

  it('byte-identical roundtrip', () => {
    const { header, records } = parseRec(sample);
    const rebuilt = buildRec(header, records);
    expect(rebuilt).toEqual(sample);
  });

  it('maps record century into full recordDate year', () => {
    const { records } = parseRec(sample);
    const first = records[0]!;
    const bytes = sample.slice(RECORD_SIZE, RECORD_SIZE * 2);
    const expectedCentury = String.fromCharCode(bytes[109]!, bytes[110]!);
    const yy = Number(String.fromCharCode(bytes[95]!, bytes[96]!));
    expect(first.recordCentury).toBe(expectedCentury);
    expect(first.recordDate.year).toBe(Number(expectedCentury) * 100 + yy);
  });

  it('exposes full 80-char holder field', () => {
    const { records } = parseRec(sample);
    const first = records[0]!;
    expect(first.holderRaw).toBeDefined();
    expect(first.holderRaw?.length).toBe(80);
  });
});

describe('rec record date/century serialization', () => {
  function individual(overrides: Partial<RecIndividualRecord> = {}): RecIndividualRecord {
    return {
      typeFlag: 'I',
      eventCode: '1150  ',
      ageBand: '1112',
      seconds: 23.55,
      recordDate: { year: 2024, month: 7, day: 24 },
      lscCode: '  ',
      clubCode: 'ESWIM',
      timeType: 'A',
      recordCentury: '20',
      trailingPad: new Uint8Array(9).fill(0x20),
      swimmerName: 'Test Swimmer',
      teamAffiliation: '',
      holderTail: new Uint8Array(34).fill(0x20),
      ...overrides,
    };
  }

  it('writes record century from the recordDate year', () => {
    const row = buildDataRecord(
      individual({ recordDate: { year: 1999, month: 7, day: 24 }, recordCentury: '' }),
    );
    expect(String.fromCharCode(row[109]!, row[110]!)).toBe('19');
    expect(String.fromCharCode(row[91]!, row[92]!, row[93]!, row[94]!, row[95]!, row[96]!)).toBe(
      '072499',
    );
  });

  it('preserves age band encodings with leading/trailing spaces', () => {
    const underBuilt = buildDataRecord(individual({ ageBand: '  10' }));
    const overBuilt = buildDataRecord(individual({ ageBand: '17  ' }));
    expect(
      String.fromCharCode(underBuilt[6]!, underBuilt[7]!, underBuilt[8]!, underBuilt[9]!),
    ).toBe('  10');
    expect(String.fromCharCode(overBuilt[6]!, overBuilt[7]!, overBuilt[8]!, overBuilt[9]!)).toBe(
      '17  ',
    );
  });

  it('build uses holderRaw when provided', () => {
    const holderRaw = 'RAW HOLDER VALUE'.padEnd(80, ' ');
    const row = buildDataRecord(
      individual({ holderRaw, swimmerName: 'Ignored Name', teamAffiliation: 'Ignored Team' }),
    );
    expect(String.fromCharCode(...row.slice(11, 91))).toBe(holderRaw);
  });

  it('preserves windows-1252 characters in holder text', () => {
    const holderRaw = 'Café™'.padEnd(80, ' ');
    const row = buildDataRecord(individual({ holderRaw, swimmerName: '', teamAffiliation: '' }));
    expect(row[11]).toBe(0x43); // C
    expect(row[12]).toBe(0x61); // a
    expect(row[13]).toBe(0x66); // f
    expect(row[14]).toBe(0xe9); // é
    expect(row[15]).toBe(0x99); // ™
  });
});
