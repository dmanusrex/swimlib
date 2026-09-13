/**
 * Relay Event (E0) Record Model
 *
 * Contains relay event information.
 * Each E0 record may be followed by multiple F0 (Relay Name) records.
 */

import { SwimTime } from '../../core/swimtime';
import { FieldRequirement, FieldType, type FieldDefinition } from '../fields';
import {
  CourseStatusCode,
  EventSexCode,
  EventTimeClassCode,
  OrganizationCode,
  StrokeCode,
} from '../codes';
import { SdifRecord, stringifyFieldValue } from './base';

export class RelayEventRecord extends SdifRecord {
  readonly identifier = 'E0';

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
      name: 'relayTeamName',
      start: 12,
      length: 1,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.MANDATORY_M1,
    },
    {
      name: 'teamCode',
      start: 13,
      length: 6,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.MANDATORY_M1,
    },
    {
      name: 'nF0Records',
      start: 19,
      length: 2,
      type: FieldType.INTEGER,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'eventSex',
      start: 21,
      length: 1,
      type: FieldType.CODE,
      requirement: FieldRequirement.MANDATORY_M1,
      codeType: EventSexCode,
    },
    {
      name: 'relayDistance',
      start: 22,
      length: 4,
      type: FieldType.INTEGER,
      requirement: FieldRequirement.MANDATORY_M1,
    },
    {
      name: 'stroke',
      start: 26,
      length: 1,
      type: FieldType.CODE,
      requirement: FieldRequirement.MANDATORY_M1,
      codeType: StrokeCode,
    },
    {
      name: 'eventNumber',
      start: 27,
      length: 4,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'eventAge',
      start: 31,
      length: 4,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.MANDATORY_M1,
    },
    {
      name: 'totalAthleteAge',
      start: 35,
      length: 3,
      type: FieldType.INTEGER,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'swimDate',
      start: 38,
      length: 8,
      type: FieldType.DATE,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'seedTime',
      start: 46,
      length: 8,
      type: FieldType.TIME,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'seedCourse',
      start: 54,
      length: 1,
      type: FieldType.CODE,
      requirement: FieldRequirement.OPTIONAL,
      codeType: CourseStatusCode,
    },
    {
      name: 'prelimTime',
      start: 55,
      length: 8,
      type: FieldType.TIME,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'prelimCourse',
      start: 63,
      length: 1,
      type: FieldType.CODE,
      requirement: FieldRequirement.OPTIONAL,
      codeType: CourseStatusCode,
    },
    {
      name: 'swimOffTime',
      start: 64,
      length: 8,
      type: FieldType.TIME,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'swimOffCourse',
      start: 72,
      length: 1,
      type: FieldType.CODE,
      requirement: FieldRequirement.OPTIONAL,
      codeType: CourseStatusCode,
    },
    {
      name: 'finalsTime',
      start: 73,
      length: 8,
      type: FieldType.TIME,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'finalsCourse',
      start: 81,
      length: 1,
      type: FieldType.CODE,
      requirement: FieldRequirement.OPTIONAL,
      codeType: CourseStatusCode,
    },
    {
      name: 'prelimHeat',
      start: 82,
      length: 2,
      type: FieldType.INTEGER,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'prelimLane',
      start: 84,
      length: 2,
      type: FieldType.INTEGER,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'finalsHeat',
      start: 86,
      length: 2,
      type: FieldType.INTEGER,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'finalsLane',
      start: 88,
      length: 2,
      type: FieldType.INTEGER,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'prelimPlace',
      start: 90,
      length: 3,
      type: FieldType.INTEGER,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'finalsPlace',
      start: 93,
      length: 3,
      type: FieldType.INTEGER,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'finalsPoints',
      start: 96,
      length: 4,
      type: FieldType.DECIMAL,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'eventTimeClassLower',
      start: 100,
      length: 1,
      type: FieldType.CODE,
      requirement: FieldRequirement.OPTIONAL,
      codeType: EventTimeClassCode,
    },
    {
      name: 'eventTimeClassUpper',
      start: 101,
      length: 1,
      type: FieldType.CODE,
      requirement: FieldRequirement.OPTIONAL,
      codeType: EventTimeClassCode,
    },
  ];

  organization?: OrganizationCode;
  relayTeamName!: string;
  teamCode!: string;
  nF0Records?: number;
  eventSex!: EventSexCode;
  relayDistance!: number;
  stroke!: StrokeCode;
  eventNumber?: string;
  eventAge!: string;
  totalAthleteAge?: number;
  swimDate?: Date;
  seedTime?: SwimTime;
  seedCourse?: CourseStatusCode;
  prelimTime?: SwimTime;
  prelimCourse?: CourseStatusCode;
  swimOffTime?: SwimTime;
  swimOffCourse?: CourseStatusCode;
  finalsTime?: SwimTime;
  finalsCourse?: CourseStatusCode;
  prelimHeat?: number;
  prelimLane?: number;
  finalsHeat?: number;
  finalsLane?: number;
  prelimPlace?: number;
  finalsPlace?: number;
  finalsPoints?: number;
  eventTimeClassLower?: EventTimeClassCode;
  eventTimeClassUpper?: EventTimeClassCode;

  constructor(data?: Partial<RelayEventRecord>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  protected formatFieldValue(value: unknown, field: FieldDefinition): string {
    if (field.name === 'teamCode' && value) {
      return stringifyFieldValue(value).toUpperCase().slice(0, field.length).padEnd(field.length);
    }

    if (field.type === FieldType.INTEGER && value !== undefined && value !== null) {
      return stringifyFieldValue(value).padStart(field.length);
    }

    if (field.type === FieldType.TIME && value instanceof SwimTime) {
      return value.format().padStart(field.length);
    }

    return super.formatFieldValue(value, field);
  }

  protected parseFieldValue(value: string, field: FieldDefinition): unknown {
    if (field.name === 'teamCode') {
      return value.trim().toUpperCase();
    }

    if (field.type === FieldType.INTEGER) {
      const trimmed = value.trim();
      return trimmed ? parseInt(trimmed, 10) : undefined;
    }

    if (field.type === FieldType.TIME) {
      const trimmed = value.trim();
      return trimmed ? SwimTime.fromString(trimmed) : undefined;
    }

    return super.parseFieldValue(value, field);
  }
}
