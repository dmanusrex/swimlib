/**
 * HY3 swimmer-address record (D2).
 *
 * Stores address lines at columns 2-31 and 32-61, city at 62-81, reserved
 * space at 82-91, state or province at 92-93, postal code at 94-103, and
 * country code at 104-106.
 */
import { FieldRequirement, FieldType, type FieldDefinition } from '../fields';
import { CHECKSUM_FIELD, HytekRecord } from './base';

export class SwimmerAddressRecord extends HytekRecord {
  readonly identifier = 'D2';

  protected readonly fields: FieldDefinition[] = [
    {
      name: 'address1',
      start: 3,
      length: 30,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'address2',
      start: 33,
      length: 30,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'city',
      start: 63,
      length: 20,
      type: FieldType.ALPHA,
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
    CHECKSUM_FIELD,
  ];

  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  checksum?: string;

  constructor(data?: Partial<SwimmerAddressRecord>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }
}
