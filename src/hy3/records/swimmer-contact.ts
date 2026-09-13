/**
 * HY3 swimmer-contact record (DF).
 *
 * Stores the swimmer's middle name at columns 2-21, cell phone at 22-41, and
 * email address at 42-91.
 */
import { FieldRequirement, FieldType, type FieldDefinition } from '../fields';
import { CHECKSUM_FIELD, HytekRecord } from './base';

export class SwimmerContactRecord extends HytekRecord {
  readonly identifier = 'DF';

  protected readonly fields: FieldDefinition[] = [
    {
      name: 'middleName',
      start: 3,
      length: 20,
      type: FieldType.NAME,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'cellPhone',
      start: 23,
      length: 20,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'email',
      start: 43,
      length: 50,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    CHECKSUM_FIELD,
  ];

  middleName?: string;
  cellPhone?: string;
  email?: string;
  checksum?: string;

  constructor(data?: Partial<SwimmerContactRecord>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }
}
