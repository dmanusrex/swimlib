/**
 * HY3 medical-condition record (D8).
 *
 * Stores a free-text medical-condition description in columns 2-121.
 */
import { FieldRequirement, FieldType, type FieldDefinition } from '../fields';
import { CHECKSUM_FIELD, HytekRecord } from './base';

export class MedicalConditionRecord extends HytekRecord {
  readonly identifier = 'D8';

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

  constructor(data?: Partial<MedicalConditionRecord>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }
}
