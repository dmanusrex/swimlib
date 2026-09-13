/**
 * HY3 secondary-contact phone record (D7).
 *
 * Stores the first secondary parent's office phone at columns 2-21, household
 * phone at 22-41, fax at 42-61, first secondary-parent email at 62-111, and
 * city overflow at 112-125.
 */
import { FieldRequirement, FieldType, type FieldDefinition } from '../fields';
import { CHECKSUM_FIELD, HytekRecord } from './base';

export class SecondaryContactPhoneRecord extends HytekRecord {
  readonly identifier = 'D7';

  protected readonly fields: FieldDefinition[] = [
    {
      name: 'parent1OfficePhone',
      start: 3,
      length: 20,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'homePhone',
      start: 23,
      length: 20,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'fax',
      start: 43,
      length: 20,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'parent1Email',
      start: 63,
      length: 50,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'cityOverflow',
      start: 113,
      length: 14,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    CHECKSUM_FIELD,
  ];

  parent1OfficePhone?: string;
  homePhone?: string;
  fax?: string;
  parent1Email?: string;
  cityOverflow?: string;
  checksum?: string;

  constructor(data?: Partial<SecondaryContactPhoneRecord>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }
}
