/**
 * HY3 swimmer-phone record (D3).
 *
 * Uses columns 2-31 as reserved space, followed by phone fields at columns
 * 32-51 and 52-71, fax at 72-91, and email at 92-127.
 */
import { FieldRequirement, FieldType, type FieldDefinition } from '../fields';
import { CHECKSUM_FIELD, HytekRecord } from './base';

export class SwimmerPhoneRecord extends HytekRecord {
  readonly identifier = 'D3';

  protected readonly fields: FieldDefinition[] = [
    {
      name: 'phone1',
      start: 33,
      length: 20,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'phone2',
      start: 53,
      length: 20,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'fax',
      start: 73,
      length: 20,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'email',
      start: 93,
      length: 36,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    CHECKSUM_FIELD,
  ];

  /** Primary guardian's office phone. */
  phone1?: string;
  /** Household phone. */
  phone2?: string;
  fax?: string;
  email?: string;
  checksum?: string;

  constructor(data?: Partial<SwimmerPhoneRecord>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }
}
