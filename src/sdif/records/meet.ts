/**
 * Meet (B1) Record Model
 *
 * Identifies the meet name and address. The meet name is required, plus the
 * city, state, meet type, start and end dates. Each file may only have one
 * record of this type; each meet record may contain multiple C1 records.
 */

import { FieldRequirement, FieldType, type FieldDefinition } from '../fields';
import { CourseStatusCode, MeetTypeCode, OrganizationCode } from '../codes';
import { SdifRecord, stringifyFieldValue } from './base';

export class MeetRecord extends SdifRecord {
  readonly identifier = 'B1';

  protected readonly fields: FieldDefinition[] = [
    {
      name: 'organization',
      start: 3,
      length: 1,
      type: FieldType.CODE,
      requirement: FieldRequirement.OPTIONAL,
      codeType: OrganizationCode,
    },
    {
      name: 'meetName',
      start: 12,
      length: 30,
      type: FieldType.NAME,
      requirement: FieldRequirement.MANDATORY_M1,
    },
    {
      name: 'meetAddress1',
      start: 42,
      length: 22,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'meetAddress2',
      start: 64,
      length: 22,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'meetCity',
      start: 86,
      length: 20,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.MANDATORY_M2,
    },
    {
      name: 'meetState',
      start: 106,
      length: 2,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.MANDATORY_M2,
    },
    {
      name: 'meetPostalCode',
      start: 108,
      length: 10,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'meetCountry',
      start: 118,
      length: 3,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'meetCode',
      start: 121,
      length: 1,
      type: FieldType.CODE,
      requirement: FieldRequirement.MANDATORY_M2,
      codeType: MeetTypeCode,
    },
    {
      name: 'meetStartDate',
      start: 122,
      length: 8,
      type: FieldType.DATE,
      requirement: FieldRequirement.MANDATORY_M1,
    },
    {
      name: 'meetEndDate',
      start: 130,
      length: 8,
      type: FieldType.DATE,
      requirement: FieldRequirement.MANDATORY_M2,
    },
    {
      name: 'poolAltitudeFeet',
      start: 138,
      length: 4,
      type: FieldType.INTEGER,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'meetCourse',
      start: 150,
      length: 1,
      type: FieldType.CODE,
      requirement: FieldRequirement.OPTIONAL,
      codeType: CourseStatusCode,
    },
  ];

  organization?: OrganizationCode;
  meetName!: string;
  meetAddress1?: string;
  meetAddress2?: string;
  meetCity?: string;
  meetState?: string;
  meetPostalCode?: string;
  meetCountry?: string;
  meetCode?: MeetTypeCode;
  meetStartDate!: Date;
  meetEndDate?: Date;
  poolAltitudeFeet?: number;
  meetCourse?: CourseStatusCode;

  constructor(data?: Partial<MeetRecord>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  protected formatFieldValue(value: unknown, field: FieldDefinition): string {
    // Country codes are uppercase per ISO convention
    if (field.name === 'meetCountry' && value) {
      return stringifyFieldValue(value).toUpperCase().slice(0, field.length).padEnd(field.length);
    }

    if (field.name === 'poolAltitudeFeet' && value !== undefined && value !== null) {
      return stringifyFieldValue(value).slice(-field.length).padStart(field.length);
    }

    return super.formatFieldValue(value, field);
  }

  protected parseFieldValue(value: string, field: FieldDefinition): unknown {
    if (field.name === 'meetCountry') {
      return value.trim().toUpperCase();
    }

    if (field.name === 'poolAltitudeFeet') {
      const trimmed = value.trim();
      return trimmed ? parseInt(trimmed, 10) : undefined;
    }

    return super.parseFieldValue(value, field);
  }
}
