/**
 * HY3 emergency-contact record (D6).
 *
 * Stores the physician name at columns 2-31, physician phone at 32-51,
 * emergency-contact name at 52-81, and emergency-contact phone at 82-101.
 */
import { FieldRequirement, FieldType, type FieldDefinition } from '../fields';
import { CHECKSUM_FIELD, HytekRecord } from './base';

export class EmergencyContactRecord extends HytekRecord {
  readonly identifier = 'D6';

  protected readonly fields: FieldDefinition[] = [
    {
      name: 'doctorName',
      start: 3,
      length: 30,
      type: FieldType.NAME,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'doctorPhone',
      start: 33,
      length: 20,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'emergencyName',
      start: 53,
      length: 30,
      type: FieldType.NAME,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'emergencyPhone',
      start: 83,
      length: 20,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    CHECKSUM_FIELD,
  ];

  doctorName?: string;
  doctorPhone?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  checksum?: string;

  constructor(data?: Partial<EmergencyContactRecord>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }
}
