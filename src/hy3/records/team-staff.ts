/**
 * HY3 team-staff record (C6).
 *
 * Stores a staff member's name at columns 2-31 and role at 32-51. This record
 * is supported because it appears in observed Team Manager exports.
 */
import { FieldRequirement, FieldType, type FieldDefinition } from '../fields';
import { CHECKSUM_FIELD, HytekRecord } from './base';

export class TeamStaffRecord extends HytekRecord {
  readonly identifier = 'C6';

  protected readonly fields: FieldDefinition[] = [
    {
      name: 'name',
      start: 3,
      length: 30,
      type: FieldType.NAME,
      requirement: FieldRequirement.MANDATORY,
    },
    {
      name: 'role',
      start: 33,
      length: 20,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    CHECKSUM_FIELD,
  ];

  name!: string;
  role?: string;
  checksum?: string;

  constructor(data?: Partial<TeamStaffRecord>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }
}
