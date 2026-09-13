import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  buildEv3,
  buildHeaderLine,
  calculateEv3Checksum,
  Ev3BuildError,
  parseEv3,
} from '../../src/ev3/index';

const SAMPLE = new URL('../fixtures/sample-meet.ev3', import.meta.url);

describe('EV3 writer', () => {
  const sample = fs.readFileSync(SAMPLE, 'latin1');

  it('parse → build round-trips the sample except its synthetic check digit', () => {
    const parsed = parseEv3(sample);
    // The committed sample carries a synthetic '12345' check digit, so it
    // parses with a checksum warning...
    expect(parsed.warnings.map((w) => w.code)).toEqual(['checksum-mismatch']);

    // ...and building with preserveCheckDigit reproduces it byte-for-byte.
    const preserved = buildEv3(parsed, { preserveCheckDigit: true });
    expect(preserved).toBe(sample);
  });

  it('build computes a valid check digit that verifies on re-parse', () => {
    const parsed = parseEv3(sample);
    const built = buildEv3(parsed);
    const reparsed = parseEv3(built);
    expect(reparsed.warnings).toEqual([]);
    expect(reparsed.events).toHaveLength(parsed.events.length);
  });

  it('checksum-valid output round-trips byte-identically', () => {
    const valid = buildEv3(parseEv3(sample));
    expect(buildEv3(parseEv3(valid))).toBe(valid);
  });

  it('writes CRLF line endings with a trailing terminator', () => {
    const built = buildEv3(parseEv3(sample));
    expect(built.endsWith('\r\n')).toBe(true);
    expect(built.split('\r\n').length - 1).toBe(parseEv3(sample).events.length + 1);
  });

  it('writes no-time qualifying fields as empty, not 0.00', () => {
    const parsed = parseEv3(sample);
    const withEmpty = parsed.events.find((e) => e.lcm_dqt === '0.00');
    expect(withEmpty).toBeDefined();
    const built = buildEv3(parsed);
    expect(built).not.toContain(';0.00;0.00;');
  });

  it('checksum matches the documented algorithm', () => {
    const parsed = parseEv3(sample);
    const headerLine = buildHeaderLine(parsed.header);
    const withoutDigit = headerLine.substring(0, headerLine.lastIndexOf(';'));
    const digit = headerLine.substring(headerLine.lastIndexOf(';') + 1);
    expect(calculateEv3Checksum(withoutDigit)).toBe(digit);
    // 4 digits + third character of the line
    expect(digit).toHaveLength(5);
    expect(digit.charAt(4)).toBe(withoutDigit.charAt(2));
  });

  it('rejects headers too short to checksum', () => {
    const parsed = parseEv3(sample);
    const tiny = {
      ...parsed.header,
      meet_name: 'X',
      pool_name: '',
      pool_address1: '',
      pool_address2: '',
      pool_city: '',
      meet_software: '',
      meet_sw_version: '',
      file_format: '',
      entry_deadline: '',
      entry_open_date: '',
      date_generated: '',
      meet_start_date: '',
      meet_end_date: '',
      age_up_date: '',
      valid_times_start_date: '',
      sanction_number: '',
      pool_postal_code: '',
      pool_country: '',
      pool_province: '',
      host_LSC: '',
    };
    expect(() => buildEv3({ header: tiny, events: [] })).toThrow(Ev3BuildError);
    expect(() => buildEv3({ header: tiny, events: [] })).toThrow(/128/);
  });

  it('rejects field values containing the delimiter', () => {
    const parsed = parseEv3(sample);
    parsed.header.meet_name = 'Bad;Name';
    expect(() => buildEv3(parsed)).toThrow(/delimiter/);
  });
});
