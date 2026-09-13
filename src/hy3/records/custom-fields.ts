/**
 * HY3 custom-field record (DA).
 *
 * Stores up to three name/value pairs. Each name and value occupies a
 * 20-character field: name 1 at columns 2-21, value 1 at 22-41, name 2 at
 * 42-61, value 2 at 62-81, name 3 at 82-101, and value 3 at 102-121.
 */
import { FieldRequirement, FieldType, type FieldDefinition } from '../fields';
import { CHECKSUM_FIELD, HytekRecord } from './base';

export class CustomFieldsRecord extends HytekRecord {
  readonly identifier = 'DA';

  protected readonly fields: FieldDefinition[] = [
    {
      name: 'field1Name',
      start: 3,
      length: 20,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'field1Value',
      start: 23,
      length: 20,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'field2Name',
      start: 43,
      length: 20,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'field2Value',
      start: 63,
      length: 20,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'field3Name',
      start: 83,
      length: 20,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'field3Value',
      start: 103,
      length: 20,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    CHECKSUM_FIELD,
  ];

  field1Name?: string;
  field1Value?: string;
  field2Name?: string;
  field2Value?: string;
  field3Name?: string;
  field3Value?: string;
  checksum?: string;

  constructor(data?: Partial<CustomFieldsRecord>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }
}
