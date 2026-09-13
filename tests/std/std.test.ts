import fs from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  buildStd,
  parseStd,
  ST2_BLOCK_SIZE,
  STD_BLOCK_SIZE,
  TIME_KIND_ORDER,
  type StdHeader,
  type StdStandard,
  type StdTimeMatrix,
} from '../../src/std/index';

const ST2_FIXTURE = new URL('../fixtures/test_std.st2', import.meta.url);

function emptyMatrix(labelCount: number, fill: number): StdTimeMatrix {
  const row = Array.from({ length: labelCount }, () => fill);
  return {
    scmDqt: [...row],
    lcmDqt: [...row],
    scyDqt: [...row],
    scmQt: [...row],
    lcmQt: [...row],
    scyQt: [...row],
  };
}

/** Expected first-row times from st2-test-pattern.txt (Men Free 25). */
const PATTERN_FIRST_ROW: Record<string, number[]> = {
  scmDqt: [20, 20.01, 20.02, 20.03, 20.04, 20.05, 20.05, 20.07, 20.07, 20.09, 20.1, 20.11],
  lcmDqt: [20.12, 20.13, 20.14, 20.14, 20.16, 20.17, 20.18, 20.19, 20.2, 20.21, 20.22, 20.23],
  scyDqt: [20.23, 20.25, 20.26, 20.27, 20.28, 20.29, 20.3, 20.3, 20.32, 20.32, 20.34, 20.35],
  scmQt: [20.36, 20.37, 20.38, 20.39, 20.39, 20.41, 20.42, 20.43, 20.44, 20.45, 20.46, 20.47],
  lcmQt: [20.48, 20.49, 20.5, 20.51, 20.52, 20.53, 20.54, 20.55, 20.56, 20.57, 20.58, 20.59],
  scyQt: [20.6, 20.61, 20.62, 20.63, 20.64, 20.65, 20.66, 20.67, 20.68, 20.69, 20.7, 20.71],
};

describe('std ST2 fixture', () => {
  let sample: Uint8Array;

  beforeAll(() => {
    sample = new Uint8Array(fs.readFileSync(ST2_FIXTURE));
  });

  it('fixture size is 11 * 320', () => {
    expect(sample.length).toBe(11 * ST2_BLOCK_SIZE);
  });

  it('parse yields header and 10 standard blocks', () => {
    const { header, standards, warnings } = parseStd(sample, 'st2');
    expect(header.standardBlockCount).toBe(11);
    expect(standards.length).toBe(10);
    expect(warnings).toEqual([]);
    expect(header.labels).toEqual([
      'AA01',
      'AA02',
      'AA03',
      'AA04',
      'AA05',
      'AA06',
      'AA07',
      'AA08',
      'AA09',
      'AA10',
      'AA11',
      'AA12',
    ]);
    expect(header.createdDate).toEqual({ year: 2026, month: 6, day: 4 });
    expect(header.yearIds.every((y) => y === '2012')).toBe(true);
  });

  it('parses first standard metadata and times', () => {
    const { standards } = parseStd(sample, 'st2');
    const first = standards[0]!;
    expect(first.gender).toBe('1');
    expect(first.stroke).toBe('1');
    expect(first.distance).toBe('25');
    expect(first.lowerAge).toBe('11');
    expect(first.upperAge).toBe('12');
    expect(first.typeFlag).toBe('I');

    for (const kind of TIME_KIND_ORDER) {
      const expected = PATTERN_FIRST_ROW[kind]!;
      for (let i = 0; i < 12; i++) {
        expect(Math.abs(first.times[kind][i]! - expected[i]!)).toBeLessThan(0.02);
      }
    }
  });

  it('byte-identical roundtrip', () => {
    const parsed = parseStd(sample, 'st2');
    const rebuilt = buildStd(parsed.header, parsed.standards, 'st2');
    expect(rebuilt).toEqual(sample);
  });

  it('ignores trailing junk after logical file end with a warning', () => {
    const junk = new Uint8Array(sample.length + 17);
    junk.set(sample, 0);
    for (let i = sample.length; i < junk.length; i++) junk[i] = 0xff;

    const parsedClean = parseStd(sample, 'st2');
    const parsedJunk = parseStd(junk, 'st2');
    expect(parsedJunk.header.standardBlockCount).toBe(parsedClean.header.standardBlockCount);
    expect(parsedJunk.standards.length).toBe(parsedClean.standards.length);
    expect(parsedJunk.warnings.map((w) => w.code)).toEqual(['trailing-data-ignored']);
    expect(buildStd(parsedJunk.header, parsedJunk.standards, 'st2')).toEqual(
      buildStd(parsedClean.header, parsedClean.standards, 'st2'),
    );
  });

  it('throws on truncated file', () => {
    const short = sample.subarray(0, sample.length - 1);
    expect(() => parseStd(short, 'st2')).toThrow(/truncated file/);
  });

  it('treats null bytes in times region as zero', () => {
    const timesOff = ST2_BLOCK_SIZE + 20;
    const patched = new Uint8Array(sample);
    patched.fill(0, timesOff, timesOff + 4);
    const { standards } = parseStd(patched, 'st2');
    expect(standards[0]!.times.scmDqt[0]).toBe(0);
    expect(standards[0]!.times.lcmDqt[0]).toBeCloseTo(20.12, 2);
  });
});

describe('std STD programmatic', () => {
  const header: StdHeader = {
    standardBlockCount: 2,
    createdDate: { year: 2026, month: 1, day: 15 },
    labels: ['BB01', 'BB02', 'BB03', 'BB04', 'BB05', 'BB06', 'BB07', 'BB08'],
    yearIds: ['2026', '2026', '2026', '2026', '2026', '2026', '2026', '2026'],
  };

  const standard: StdStandard = {
    gender: '2',
    stroke: '3',
    distance: '100',
    lowerAge: '13',
    upperAge: '14',
    typeFlag: 'I',
    times: emptyMatrix(8, 65.432),
  };

  it('builds and round-trips a minimal STD file', () => {
    const built = buildStd(header, [standard], 'std');
    expect(built.length).toBe(2 * STD_BLOCK_SIZE);

    const parsed = parseStd(built, 'std');
    expect(parsed.header.standardBlockCount).toBe(2);
    expect(parsed.standards.length).toBe(1);
    expect(parsed.standards[0]!.distance).toBe('100');
    expect(parsed.standards[0]!.times.scmDqt[0]).toBeCloseTo(65.432, 3);

    const rebuilt = buildStd(parsed.header, parsed.standards, 'std');
    expect(rebuilt).toEqual(built);
  });
});

describe('std errors', () => {
  it('rejects wrong magic', () => {
    const bad = new Uint8Array(ST2_BLOCK_SIZE);
    bad.fill(0x20);
    bad.set([0x58, 0x58, 0x58], 0);
    expect(() => parseStd(bad, 'st2')).toThrow(/STD/);
  });
});
