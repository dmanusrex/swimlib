/**
 * Meet Host (B2) Record Model
 *
 * Identifies the meet host or hosts and the host address. The meet host name
 * is required. Additional fields provide for the street address, city, state,
 * postal code, country code and phone number.
 */

import { FieldRequirement, FieldType, type FieldDefinition } from '../fields';
import { OrganizationCode } from '../codes';
import { SdifRecord, stringifyFieldValue } from './base';

export class MeetHostRecord extends SdifRecord {
  readonly identifier = 'B2';

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
      name: 'hostName',
      start: 12,
      length: 30,
      type: FieldType.NAME,
      requirement: FieldRequirement.MANDATORY_M2,
    },
    {
      name: 'hostAddress1',
      start: 42,
      length: 22,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'hostAddress2',
      start: 64,
      length: 22,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'hostCity',
      start: 86,
      length: 20,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'hostState',
      start: 106,
      length: 2,
      type: FieldType.USPS,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'hostPostalCode',
      start: 108,
      length: 10,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'hostCountry',
      start: 118,
      length: 3,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'hostPhone',
      start: 121,
      length: 12,
      type: FieldType.PHONE,
      requirement: FieldRequirement.OPTIONAL,
    },
  ];

  organization?: OrganizationCode;
  hostName?: string;
  hostAddress1?: string;
  hostAddress2?: string;
  hostCity?: string;
  hostState?: string;
  hostPostalCode?: string;
  hostCountry?: string;
  hostPhone?: string;

  constructor(data?: Partial<MeetHostRecord>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  protected formatFieldValue(value: unknown, field: FieldDefinition): string {
    // Country codes are uppercase per ISO convention
    if (field.name === 'hostCountry' && value) {
      return stringifyFieldValue(value).toUpperCase().slice(0, field.length).padEnd(field.length);
    }

    return super.formatFieldValue(value, field);
  }

  protected parseFieldValue(value: string, field: FieldDefinition): unknown {
    if (field.name === 'hostCountry') {
      return value.trim().toUpperCase();
    }

    return super.parseFieldValue(value, field);
  }
}
