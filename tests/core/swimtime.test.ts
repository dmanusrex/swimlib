import { describe, expect, it } from 'vitest';
import { TimeCode } from '../../src/core/codes';
import { SwimTime } from '../../src/core/swimtime';

describe('SwimTime', () => {
  it('parses MM:SS.HH', () => {
    expect(SwimTime.fromString('1:05.32').getHundredths()).toBe(6532);
  });

  it('parses SS.HH', () => {
    expect(SwimTime.fromString('23.55').getHundredths()).toBe(2355);
  });

  it('parses HY3 raw-seconds times over a minute', () => {
    // Hy-Tek HY3 writes times over a minute as raw seconds ('138.08'
    // = 2:18.08) rather than MM:SS.HH.
    expect(SwimTime.fromString('138.08').getHundredths()).toBe(13808);
    expect(SwimTime.fromString('64.93').getHundredths()).toBe(6493);
    expect(SwimTime.fromString('1345.67').getHundredths()).toBe(134567);
  });

  it('parses special codes', () => {
    const t = SwimTime.fromString('NT');
    expect(t.isCode()).toBe(true);
    expect(t.getCode()).toBe(TimeCode.NO_TIME);
  });

  it('rejects garbage', () => {
    expect(() => SwimTime.fromString('fast')).toThrow(RangeError);
  });

  it('trims whitespace around times and time codes', () => {
    expect(SwimTime.fromString(' 1:23.45 ').getHundredths()).toBe(8345);
    expect(SwimTime.fromString('NT ').getCode()).toBe(TimeCode.NO_TIME);
    expect(SwimTime.fromString(' DQ').getCode()).toBe(TimeCode.DISQUALIFIED);
  });

  it('formats right-justified in 8 characters', () => {
    expect(SwimTime.fromString('1:05.32').format()).toBe(' 1:05.32');
    expect(SwimTime.fromString('23.55').format()).toBe('   23.55');
    expect(SwimTime.fromCode(TimeCode.NO_TIME).format()).toBe('NT      ');
  });

  it('bridges to centiseconds', () => {
    expect(SwimTime.fromCentiseconds(2355).toCentiseconds()).toBe(2355);
  });

  it('compares durations and refuses codes', () => {
    expect(SwimTime.fromString('23.55').compareTo(SwimTime.fromString('24.00'))).toBeLessThan(0);
    expect(() =>
      SwimTime.fromCode(TimeCode.DISQUALIFIED).compareTo(SwimTime.fromString('24.00')),
    ).toThrow(RangeError);
  });
});
