/**
 * HY3 medication record (D9).
 *
 * Stores a free-text medication description in columns 2-121.
 */
import { FieldRequirement, FieldType, type FieldDefinition } from '../fields';
import { CHECKSUM_FIELD, HytekRecord } from './base';

export class MedicationRecord extends HytekRecord {
  readonly identifier = 'D9';

  protected readonly fields: FieldDefinition[] = [
    {
      name: 'description',
      start: 3,
      length: 120,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    CHECKSUM_FIELD,
  ];

  description?: string;
  checksum?: string;

  constructor(data?: Partial<MedicationRecord>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }
}
