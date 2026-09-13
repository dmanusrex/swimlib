/**
 * E1 identifies an individual entry. The swimmer key occupies [2:12], event
 * category [13:14], distance [15:20], stroke [21], age limits [22:27], fee
 * [32:37], and event number [38:40]. Seed and conversion values occupy
 * [42:76].
 *
 * Numeric text is right-aligned. Observed result exports reuse [60:67] for
 * points and may carry additional age and course flags later in the payload.
 * The implementation exposes those observed values without assigning semantics
 * to bytes that remain unknown.
 */
import { SwimTime } from '../../core/swimtime';
import { FieldRequirement, FieldType, type FieldDefinition } from '../fields';
import { CourseStatusCode, SexCode, StrokeCode } from '../codes';
import { CHECKSUM_FIELD, HytekRecord } from './base';

export class IndividualEventRecord extends HytekRecord {
  readonly identifier = 'E1';

  protected readonly fields: FieldDefinition[] = [
    {
      name: 'swimmerGender',
      start: 3,
      length: 1,
      type: FieldType.CODE,
      requirement: FieldRequirement.OPTIONAL,
      codeType: SexCode,
    },
    {
      name: 'swimmerId',
      start: 4,
      length: 5,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.MANDATORY,
      justify: 'right',
    },
    {
      name: 'swimmerAbbr',
      start: 9,
      length: 5,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.MANDATORY,
    },
    {
      name: 'gender1',
      start: 14,
      length: 1,
      type: FieldType.CODE,
      requirement: FieldRequirement.OPTIONAL,
      codeType: SexCode,
    },
    {
      name: 'gender2',
      start: 15,
      length: 1,
      type: FieldType.CODE,
      requirement: FieldRequirement.OPTIONAL,
      codeType: SexCode,
    },
    {
      name: 'distance',
      start: 16,
      length: 6,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.MANDATORY,
      justify: 'right',
    },
    {
      name: 'stroke',
      start: 22,
      length: 1,
      type: FieldType.CODE,
      requirement: FieldRequirement.MANDATORY,
      codeType: StrokeCode,
    },
    {
      name: 'ageLower',
      start: 23,
      length: 3,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
      justify: 'right',
    },
    {
      name: 'ageUpper',
      start: 26,
      length: 3,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
      justify: 'right',
    },
    {
      name: 'eventFee',
      start: 33,
      length: 6,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
      justify: 'right',
    },
    {
      name: 'eventNumber',
      start: 39,
      length: 3,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
      justify: 'right',
    },
    {
      // 0-based [41]: 'L' on long-course events in TM8 results exports.
      name: 'eventCourse',
      start: 42,
      length: 1,
      type: FieldType.CODE,
      requirement: FieldRequirement.OPTIONAL,
      codeType: CourseStatusCode,
    },
    {
      name: 'conversionSeedTime1',
      start: 43,
      length: 8,
      type: FieldType.TIME,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'conversionSeedCourse1',
      start: 51,
      length: 1,
      type: FieldType.CODE,
      requirement: FieldRequirement.OPTIONAL,
      codeType: CourseStatusCode,
    },
    {
      name: 'seedTime1',
      start: 52,
      length: 8,
      type: FieldType.TIME,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'seedCourse1',
      start: 60,
      length: 1,
      type: FieldType.CODE,
      requirement: FieldRequirement.OPTIONAL,
      codeType: CourseStatusCode,
    },
    {
      name: 'conversionSeedTime2',
      start: 61,
      length: 8,
      type: FieldType.TIME,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'conversionSeedCourse2',
      start: 69,
      length: 1,
      type: FieldType.CODE,
      requirement: FieldRequirement.OPTIONAL,
      codeType: CourseStatusCode,
    },
    {
      name: 'seedTime2',
      start: 70,
      length: 7,
      type: FieldType.TIME,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'seedCourse2',
      start: 77,
      length: 1,
      type: FieldType.CODE,
      requirement: FieldRequirement.OPTIONAL,
      codeType: CourseStatusCode,
    },
    {
      // 0-based [85:87] — results exports only; equals the swimmer's age.
      name: 'age1',
      start: 86,
      length: 3,
      type: FieldType.INTEGER,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      // 0-based [88:90] — results exports only; equals the swimmer's age.
      name: 'age2',
      start: 89,
      length: 3,
      type: FieldType.INTEGER,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      // 0-based [91]: 'C' on some TM8 entries-export rows; meaning unknown.
      name: 'flag91',
      start: 92,
      length: 1,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      // 0-based [94]: repeats eventCourse ('L') in TM8 results exports.
      name: 'flag94',
      start: 95,
      length: 1,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    CHECKSUM_FIELD,
  ];

  swimmerGender?: SexCode;
  swimmerId!: string;
  swimmerAbbr!: string;
  gender1?: SexCode;
  gender2?: SexCode;
  distance!: string;
  stroke!: StrokeCode;
  ageLower?: string;
  ageUpper?: string;
  eventFee?: string;
  eventNumber?: string;
  eventCourse?: CourseStatusCode;
  conversionSeedTime1?: SwimTime;
  conversionSeedCourse1?: CourseStatusCode;
  seedTime1?: SwimTime;
  seedCourse1?: CourseStatusCode;
  conversionSeedTime2?: SwimTime;
  conversionSeedCourse2?: CourseStatusCode;
  seedTime2?: SwimTime;
  seedCourse2?: CourseStatusCode;
  age1?: number;
  age2?: number;
  flag91?: string;
  flag94?: string;
  checksum?: string;

  constructor(data?: Partial<IndividualEventRecord>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  protected formatFieldValue(value: unknown, field: FieldDefinition): string {
    // Real TM8 writes a zero conversion seed as a bare '0' (right-justified),
    // unlike every other zero time, which is written '0.00'.
    if (
      field.name === 'conversionSeedTime1' &&
      value instanceof SwimTime &&
      !value.isCode() &&
      value.getHundredths() === 0
    ) {
      return '0'.padStart(field.length, ' ');
    }

    return super.formatFieldValue(value, field);
  }
}
