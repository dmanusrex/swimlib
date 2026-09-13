/**
 * B1 carries the meet name [2:46], facility [47:91], start/end/age-up dates
 * [92:115], and pool altitude [116:120]. Dates use MMDDYYYY. The altitude is
 * five characters and right-aligned; this placement is verified against
 * exported files and does not overlap the age-up date.
 */

import { FieldRequirement, FieldType, type FieldDefinition } from '../fields';
import { CHECKSUM_FIELD, HytekRecord, stringifyFieldValue } from './base';

export class MeetRecord extends HytekRecord {
  readonly identifier = 'B1';

  protected readonly fields: FieldDefinition[] = [
    {
      name: 'meetName',
      start: 3,
      length: 45,
      type: FieldType.NAME,
      requirement: FieldRequirement.MANDATORY,
    },
    {
      name: 'meetFacility',
      start: 48,
      length: 45,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'meetStartDate',
      start: 93,
      length: 8,
      type: FieldType.DATE,
      requirement: FieldRequirement.MANDATORY,
    },
    {
      name: 'meetEndDate',
      start: 101,
      length: 8,
      type: FieldType.DATE,
      requirement: FieldRequirement.MANDATORY,
    },
    {
      name: 'ageUpDate',
      start: 109,
      length: 8,
      type: FieldType.DATE,
      requirement: FieldRequirement.MANDATORY,
    },
    {
      name: 'poolAltitudeMeters',
      start: 117,
      length: 5,
      type: FieldType.INTEGER,
      requirement: FieldRequirement.OPTIONAL,
    },
    CHECKSUM_FIELD,
  ];

  meetName!: string;
  meetFacility?: string;
  meetStartDate!: Date;
  meetEndDate!: Date;
  ageUpDate!: Date;
  poolAltitudeMeters?: number;
  checksum?: string;

  constructor(data?: Partial<MeetRecord>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  protected formatFieldValue(value: unknown, field: FieldDefinition): string {
    // Pool altitude: right-justified, truncated to the field width.
    if (field.name === 'poolAltitudeMeters' && value !== undefined && value !== null) {
      return stringifyFieldValue(value).slice(-field.length).padStart(field.length);
    }

    return super.formatFieldValue(value, field);
  }
}
