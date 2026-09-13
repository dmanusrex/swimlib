/**
 * F1 identifies a relay entry. It starts with team code [2:6], squad [7],
 * relay key [8:11], three category characters [12:14], distance [15:20],
 * stroke [21], and age limits [22:27]. Fee, event number, seed conversions,
 * and seed times occupy [32:76].
 *
 * Observed result exports reuse [60:67] for points. Numeric identifiers and
 * amounts are right-aligned. These offsets were verified against Team Manager
 * entry and result exports.
 */
import { SwimTime } from '../../core/swimtime';
import { FieldRequirement, FieldType, type FieldDefinition } from '../fields';
import { CourseStatusCode, StrokeCode } from '../codes';
import { CHECKSUM_FIELD, HytekRecord, stringifyFieldValue } from './base';

export class RelayTeamRecord extends HytekRecord {
  readonly identifier = 'F1';

  protected readonly fields: FieldDefinition[] = [
    {
      name: 'teamAbbr',
      start: 3,
      length: 5,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.MANDATORY,
    },
    {
      name: 'relayTeam',
      start: 8,
      length: 1,
      type: FieldType.ALPHA, // A, B, C...
      requirement: FieldRequirement.MANDATORY,
    },
    {
      name: 'relayId',
      start: 9,
      length: 4,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
      justify: 'right',
    },
    {
      name: 'relayGender',
      start: 13,
      length: 1,
      type: FieldType.ALPHA, // M or F
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'relayGender1',
      start: 14,
      length: 1,
      type: FieldType.ALPHA, // M or F
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'relayGender2',
      start: 15,
      length: 1,
      type: FieldType.ALPHA, // M, B, F or G
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'relayDistance',
      start: 16,
      length: 6,
      type: FieldType.INTEGER,
      requirement: FieldRequirement.MANDATORY,
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
      // Populated in results exports only: relay points scored as a decimal,
      // right-justified in 0-based [60:67].
      name: 'points',
      start: 61,
      length: 8,
      type: FieldType.DECIMAL,
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
    CHECKSUM_FIELD,
  ];

  teamAbbr!: string;
  relayTeam!: string;
  relayId?: string;
  relayGender?: string;
  relayGender1?: string;
  relayGender2?: string;
  relayDistance!: number;
  stroke!: StrokeCode;
  ageLower?: string;
  ageUpper?: string;
  eventFee?: string;
  eventNumber?: string;
  conversionSeedTime1?: SwimTime;
  conversionSeedCourse1?: CourseStatusCode;
  seedTime1?: SwimTime;
  seedCourse1?: CourseStatusCode;
  points?: number;
  conversionSeedCourse2?: CourseStatusCode;
  seedTime2?: SwimTime;
  seedCourse2?: CourseStatusCode;
  checksum?: string;

  constructor(data?: Partial<RelayTeamRecord>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  protected formatFieldValue(value: unknown, field: FieldDefinition): string {
    // Relay team designators (A, B, ...) are uppercase.
    if (field.name === 'relayTeam' && value) {
      return stringifyFieldValue(value).toUpperCase().slice(0, field.length).padEnd(field.length);
    }

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

    // Points are written as a right-justified two-decimal number ('   18.00').
    if (field.name === 'points' && value !== undefined && value !== null && value !== '') {
      return Number(value).toFixed(2).padStart(field.length, ' ');
    }

    return super.formatFieldValue(value, field);
  }

  protected parseFieldValue(value: string, field: FieldDefinition): unknown {
    if (field.name === 'relayTeam') {
      return value.trim().toUpperCase();
    }

    return super.parseFieldValue(value, field);
  }
}
