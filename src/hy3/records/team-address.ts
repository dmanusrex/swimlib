/**
 * C2 stores the team addressee, street, and city in three 30-character fields
 * [2:91]. State/province [92:93], postal code [94:103], country [104:106],
 * and registration organization [108:111] follow. Known organization values
 * are defined by TeamRegistrationCode.
 */

import { FieldRequirement, FieldType, type FieldDefinition } from '../fields';
import { TeamRegistrationCode } from '../codes';
import { CHECKSUM_FIELD, HytekRecord, stringifyFieldValue } from './base';

export class TeamAddressRecord extends HytekRecord {
  readonly identifier = 'C2';

  protected readonly fields: FieldDefinition[] = [
    {
      name: 'mailTo',
      start: 3,
      length: 30,
      type: FieldType.NAME,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'address',
      start: 33,
      length: 30,
      type: FieldType.NAME,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'city',
      start: 63,
      length: 30,
      type: FieldType.NAME,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'state',
      start: 93,
      length: 2,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'postalCode',
      start: 95,
      length: 10,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'country',
      start: 105,
      length: 3,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'teamRegistration',
      start: 109,
      length: 4,
      type: FieldType.CODE,
      requirement: FieldRequirement.OPTIONAL,
      codeType: TeamRegistrationCode,
    },
    CHECKSUM_FIELD,
  ];

  mailTo?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  teamRegistration?: TeamRegistrationCode;
  checksum?: string;

  constructor(data?: Partial<TeamAddressRecord>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  protected formatFieldValue(value: unknown, field: FieldDefinition): string {
    // Country codes are uppercase by convention.
    if (field.name === 'country' && value) {
      return stringifyFieldValue(value).toUpperCase().slice(0, field.length).padEnd(field.length);
    }

    return super.formatFieldValue(value, field);
  }

  protected parseFieldValue(value: string, field: FieldDefinition): unknown {
    if (field.name === 'country') {
      return value.trim().toUpperCase();
    }

    return super.parseFieldValue(value, field);
  }
}
