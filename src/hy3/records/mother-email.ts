/**
 * HY3 guardian-email record (DE).
 *
 * Stores the mother's email at columns 2-37, the second secondary-parent email
 * at 38-87, overflow from the mother's email at 88-101, and the mother's last
 * name at 102-121.
 */
import { FieldRequirement, FieldType, type FieldDefinition } from '../fields';
import { CHECKSUM_FIELD, HytekRecord } from './base';

export class MotherEmailRecord extends HytekRecord {
  readonly identifier = 'DE';

  protected readonly fields: FieldDefinition[] = [
    {
      name: 'motherEmail',
      start: 3,
      length: 36,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'secondaryParent2Email',
      start: 39,
      length: 50,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'motherEmailOverflow',
      start: 89,
      length: 14,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'motherLastName',
      start: 103,
      length: 20,
      type: FieldType.NAME,
      requirement: FieldRequirement.OPTIONAL,
    },
    CHECKSUM_FIELD,
  ];

  motherEmail?: string;
  secondaryParent2Email?: string;
  motherEmailOverflow?: string;
  motherLastName?: string;
  checksum?: string;

  constructor(data?: Partial<MotherEmailRecord>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }
}
