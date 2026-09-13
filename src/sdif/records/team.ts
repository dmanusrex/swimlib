/**
 * Team (C1) Record Model
 *
 * Contains team information for teams participating in a meet.
 * Each team record may contain multiple D0 (Individual Entry) records.
 */

import { FieldRequirement, FieldType, type FieldDefinition } from '../fields';
import { OrganizationCode } from '../codes';
import { SdifRecord, stringifyFieldValue } from './base';

export class TeamRecord extends SdifRecord {
  readonly identifier = 'C1';

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
      name: 'teamCode',
      start: 12,
      length: 6,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.MANDATORY_M1,
    },
    {
      name: 'name',
      start: 18,
      length: 30,
      type: FieldType.NAME,
      requirement: FieldRequirement.MANDATORY_M1,
    },
    {
      name: 'abbreviation',
      start: 48,
      length: 16,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'address1',
      start: 64,
      length: 22,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'address2',
      start: 86,
      length: 22,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'city',
      start: 108,
      length: 20,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'state',
      start: 128,
      length: 2,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'postalCode',
      start: 130,
      length: 10,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'country',
      start: 140,
      length: 3,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'region',
      start: 143,
      length: 1,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'teamCode5',
      start: 150,
      length: 1,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
  ];

  organization?: OrganizationCode;
  teamCode!: string;
  name!: string;
  abbreviation?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  region?: string;
  teamCode5?: string;

  constructor(data?: Partial<TeamRecord>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  protected formatFieldValue(value: unknown, field: FieldDefinition): string {
    // Country and team codes are conventionally uppercase
    if ((field.name === 'country' || field.name === 'teamCode') && value) {
      return stringifyFieldValue(value).toUpperCase().slice(0, field.length).padEnd(field.length);
    }
    return super.formatFieldValue(value, field);
  }

  protected parseFieldValue(value: string, field: FieldDefinition): unknown {
    if (field.name === 'country' || field.name === 'teamCode') {
      return value.trim().toUpperCase();
    }
    return super.parseFieldValue(value, field);
  }
}
