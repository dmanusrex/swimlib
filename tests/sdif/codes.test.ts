import { describe, expect, it } from 'vitest';

import { CourseStatusCode, normalizeCourseCode, PrelimsFinalsCode } from '../../src/sdif/codes';

describe('normalizeCourseCode', () => {
  it('maps integer alternates to the canonical letters', () => {
    expect(normalizeCourseCode('1')).toBe('M');
    expect(normalizeCourseCode('2')).toBe('Y');
    expect(normalizeCourseCode('3')).toBe('L');
  });

  it("maps the spec's alpha 'S' for short course meters to 'M'", () => {
    expect(normalizeCourseCode('S')).toBe('M');
  });

  it('returns already-canonical and unknown codes unchanged', () => {
    expect(normalizeCourseCode('M')).toBe('M');
    expect(normalizeCourseCode('Y')).toBe('Y');
    expect(normalizeCourseCode('L')).toBe('L');
    expect(normalizeCourseCode('X')).toBe('X');
    expect(normalizeCourseCode('?')).toBe('?');
  });
});

describe('CourseStatusCode', () => {
  it("keeps both the real-world 'M' and the spec 'S' for short course meters", () => {
    expect(CourseStatusCode.SHORT_METERS).toBe('M');
    expect(CourseStatusCode.SHORT_METERS_SPEC).toBe('S');
    expect(Object.values(CourseStatusCode)).toEqual(
      expect.arrayContaining(['M', 'S', 'Y', 'L', 'X', '1', '2', '3']),
    );
  });
});

describe('PrelimsFinalsCode', () => {
  it('matches PRELIMS/FINALS Code 019', () => {
    expect(PrelimsFinalsCode.PRELIMS).toBe('P');
    expect(PrelimsFinalsCode.FINALS).toBe('F');
    expect(PrelimsFinalsCode.SWIM_OFFS).toBe('S');
  });
});
