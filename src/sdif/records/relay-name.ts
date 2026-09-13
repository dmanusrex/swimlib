/**
 * Relay Name (F0) Record Model
 *
 * Contains information about individual swimmers in a relay team.
 * Each F0 record is associated with a parent E0 (Relay Event) record;
 * there is one F0 record per relay swimmer.
 */

import { SwimTime } from '../../core/swimtime';
import { FieldRequirement, FieldType, type FieldDefinition } from '../fields';
import { CourseStatusCode, OrderCode, OrganizationCode, SexCode } from '../codes';
import { SdifRecord, stringifyFieldValue } from './base';

export class RelayNameRecord extends SdifRecord {
  readonly identifier = 'F0';

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
      name: 'teamCode',
      start: 16,
      length: 6,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.MANDATORY_M1,
    },
    {
      name: 'relayTeamName',
      start: 22,
      length: 1,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.MANDATORY_M1,
    },
    {
      name: 'swimmerName',
      start: 23,
      length: 28,
      type: FieldType.NAME,
      requirement: FieldRequirement.MANDATORY_M1,
    },
    {
      name: 'ussNumber',
      start: 51,
      length: 12,
      type: FieldType.USS_NUM,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'citizen',
      start: 63,
      length: 3,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'birthdate',
      start: 66,
      length: 8,
      type: FieldType.DATE,
      requirement: FieldRequirement.MANDATORY_M2,
    },
    {
      name: 'ageOrClass',
      start: 74,
      length: 2,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'sex',
      start: 76,
      length: 1,
      type: FieldType.CODE,
      requirement: FieldRequirement.MANDATORY_M1,
      codeType: SexCode,
    },
    {
      name: 'prelimOrder',
      start: 77,
      length: 1,
      type: FieldType.CODE,
      requirement: FieldRequirement.OPTIONAL,
      codeType: OrderCode,
    },
    {
      name: 'swimOffOrder',
      start: 78,
      length: 1,
      type: FieldType.CODE,
      requirement: FieldRequirement.OPTIONAL,
      codeType: OrderCode,
    },
    {
      name: 'finalsOrder',
      start: 79,
      length: 1,
      type: FieldType.CODE,
      requirement: FieldRequirement.MANDATORY_M1,
      codeType: OrderCode,
    },
    {
      name: 'legTime',
      start: 80,
      length: 8,
      type: FieldType.TIME,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'course',
      start: 88,
      length: 1,
      type: FieldType.CODE,
      requirement: FieldRequirement.OPTIONAL,
      codeType: CourseStatusCode,
    },
    {
      name: 'takeoffTime',
      start: 89,
      length: 4,
      type: FieldType.DECIMAL,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'ussNumberNew',
      start: 93,
      length: 14,
      type: FieldType.USS_NUM,
      requirement: FieldRequirement.MANDATORY_M2,
    },
    {
      name: 'preferredFirstName',
      start: 107,
      length: 15,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
  ];

  organization?: OrganizationCode;
  teamCode!: string;
  relayTeamName!: string;
  swimmerName!: string;
  ussNumber?: string;
  citizen?: string;
  birthdate?: Date;
  ageOrClass?: string;
  sex!: SexCode;
  prelimOrder?: OrderCode;
  swimOffOrder?: OrderCode;
  finalsOrder!: OrderCode;
  legTime?: SwimTime;
  course?: CourseStatusCode;
  takeoffTime?: number;
  ussNumberNew?: string;
  preferredFirstName?: string;

  constructor(data?: Partial<RelayNameRecord>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  protected formatFieldValue(value: unknown, field: FieldDefinition): string {
    if ((field.name === 'teamCode' || field.name === 'citizen') && value) {
      return stringifyFieldValue(value).toUpperCase().slice(0, field.length).padEnd(field.length);
    }

    if (field.name === 'takeoffTime' && value !== undefined && value !== null) {
      return (value as number).toFixed(2).padStart(field.length);
    }

    if (field.name === 'legTime' && value instanceof SwimTime) {
      return value.format().padStart(field.length);
    }

    return super.formatFieldValue(value, field);
  }

  protected parseFieldValue(value: string, field: FieldDefinition): unknown {
    if (field.name === 'teamCode' || field.name === 'citizen') {
      return value.trim().toUpperCase();
    }

    if (field.name === 'takeoffTime') {
      const trimmed = value.trim();
      return trimmed ? parseFloat(trimmed) : undefined;
    }

    if (field.name === 'legTime') {
      const trimmed = value.trim();
      return trimmed ? SwimTime.fromString(trimmed) : undefined;
    }

    return super.parseFieldValue(value, field);
  }
}
