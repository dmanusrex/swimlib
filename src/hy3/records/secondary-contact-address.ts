/**
 * HY3 secondary-contact address record (D4).
 *
 * Stores the mail-to name at columns 2-41, street address at 42-71, city at
 * 72-91, reserved space at 92-101, state or province at 102-103, postal code
 * at 104-113, and country code at 114-116.
 */
import { FieldRequirement, FieldType, type FieldDefinition } from '../fields';
import { CHECKSUM_FIELD, HytekRecord } from './base';

export class SecondaryContactAddressRecord extends HytekRecord {
  readonly identifier = 'D4';

  protected readonly fields: FieldDefinition[] = [
    {
      name: 'mailTo',
      start: 3,
      length: 40,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'address1',
      start: 43,
      length: 30,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'city',
      start: 73,
      length: 20,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'state',
      start: 103,
      length: 2,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'postalCode',
      start: 105,
      length: 10,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'country',
      start: 115,
      length: 3,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    CHECKSUM_FIELD,
  ];

  mailTo?: string;
  address1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  checksum?: string;

  constructor(data?: Partial<SecondaryContactAddressRecord>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }
}
