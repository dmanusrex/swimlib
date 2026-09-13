/**
 * Split (G0) Record Model
 *
 * Contains split times for individual events.
 * Each G0 record is associated with a parent D0 (Individual Event) record.
 */

import { SwimTime } from '../../core/swimtime';
import { FieldRequirement, FieldType, type FieldDefinition } from '../fields';
import { OrganizationCode, PrelimsFinalsCode, SplitCode } from '../codes';
import { SdifRecord, stringifyFieldValue } from './base';

export class SplitRecord extends SdifRecord {
  readonly identifier = 'G0';

  protected readonly fields: FieldDefinition[] = [
    {
      name: 'organization',
      start: 3,
      length: 1,
      type: FieldType.CODE,
      requirement: FieldRequirement.MANDATORY_M2,
      codeType: OrganizationCode,
    },
    {
      name: 'name',
      start: 16,
      length: 28,
      type: FieldType.NAME,
      requirement: FieldRequirement.MANDATORY_M1,
    },
    {
      name: 'ussn',
      start: 44,
      length: 12,
      type: FieldType.USS_NUM,
      requirement: FieldRequirement.MANDATORY_M2,
    },
    {
      name: 'sequence',
      start: 56,
      length: 1,
      type: FieldType.INTEGER,
      requirement: FieldRequirement.MANDATORY_M1,
    },
    {
      name: 'nSplits',
      start: 57,
      length: 2,
      type: FieldType.INTEGER,
      requirement: FieldRequirement.MANDATORY_M1,
    },
    {
      name: 'splitDistance',
      start: 59,
      length: 4,
      type: FieldType.INTEGER,
      requirement: FieldRequirement.MANDATORY_M1,
    },
    {
      name: 'splitCode',
      start: 63,
      length: 1,
      type: FieldType.CODE,
      requirement: FieldRequirement.MANDATORY_M1,
      codeType: SplitCode,
    },
    {
      name: 'splitTime1',
      start: 64,
      length: 8,
      type: FieldType.TIME,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'splitTime2',
      start: 72,
      length: 8,
      type: FieldType.TIME,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'splitTime3',
      start: 80,
      length: 8,
      type: FieldType.TIME,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'splitTime4',
      start: 88,
      length: 8,
      type: FieldType.TIME,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'splitTime5',
      start: 96,
      length: 8,
      type: FieldType.TIME,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'splitTime6',
      start: 104,
      length: 8,
      type: FieldType.TIME,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'splitTime7',
      start: 112,
      length: 8,
      type: FieldType.TIME,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'splitTime8',
      start: 120,
      length: 8,
      type: FieldType.TIME,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'splitTime9',
      start: 128,
      length: 8,
      type: FieldType.TIME,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'splitTime10',
      start: 136,
      length: 8,
      type: FieldType.TIME,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'prelimsFinals',
      start: 144,
      length: 1,
      type: FieldType.CODE,
      requirement: FieldRequirement.OPTIONAL,
      codeType: PrelimsFinalsCode,
    },
  ];

  organization?: OrganizationCode;
  name!: string;
  ussn?: string;
  sequence!: number;
  nSplits!: number;
  splitDistance!: number;
  splitCode!: SplitCode;
  splitTime1?: SwimTime;
  splitTime2?: SwimTime;
  splitTime3?: SwimTime;
  splitTime4?: SwimTime;
  splitTime5?: SwimTime;
  splitTime6?: SwimTime;
  splitTime7?: SwimTime;
  splitTime8?: SwimTime;
  splitTime9?: SwimTime;
  splitTime10?: SwimTime;
  /** Which round these splits belong to (PRELIMS/FINALS Code 019). */
  prelimsFinals?: PrelimsFinalsCode;

  constructor(data?: Partial<SplitRecord>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  protected formatFieldValue(value: unknown, field: FieldDefinition): string {
    if (field.type === FieldType.INTEGER && value !== undefined && value !== null) {
      return stringifyFieldValue(value).padStart(field.length);
    }

    if (field.name === 'ussn' && value) {
      return stringifyFieldValue(value).slice(0, field.length).padEnd(field.length);
    }

    if (field.type === FieldType.TIME && value instanceof SwimTime) {
      return value.format().padStart(field.length);
    }

    return super.formatFieldValue(value, field);
  }

  protected parseFieldValue(value: string, field: FieldDefinition): unknown {
    if (field.type === FieldType.INTEGER) {
      const trimmed = value.trim();
      return trimmed ? parseInt(trimmed, 10) : undefined;
    }

    if (field.name === 'ussn') {
      return value.trim() || undefined;
    }

    if (field.type === FieldType.TIME) {
      const trimmed = value.trim();
      return trimmed ? SwimTime.fromString(trimmed) : undefined;
    }

    return super.parseFieldValue(value, field);
  }
}
