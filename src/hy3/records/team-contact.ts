/**
 * C3 stores daytime phone [32:51], evening phone [52:71], fax [72:91], and
 * email [92:127]. These offsets are verified against roster, entry, and result
 * exports; all ranges in this comment are zero-based and inclusive.
 */

import { FieldRequirement, FieldType, type FieldDefinition } from '../fields';
import { CHECKSUM_FIELD, HytekRecord } from './base';

export class TeamContactRecord extends HytekRecord {
  readonly identifier = 'C3';

  protected readonly fields: FieldDefinition[] = [
    {
      name: 'daytimePhone',
      start: 33,
      length: 20,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'eveningPhone',
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

  daytimePhone?: string;
  eveningPhone?: string;
  fax?: string;
  email?: string;
  checksum?: string;

  constructor(data?: Partial<TeamContactRecord>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }
}
