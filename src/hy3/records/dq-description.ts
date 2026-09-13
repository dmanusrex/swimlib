/**
 * HY3 disqualification-description record (H1).
 *
 * Supplements an individual or relay result with a disqualification reason.
 * The reason code occupies columns 2-3 and the free-text description occupies
 * columns 4-127.
 */
import { FieldRequirement, FieldType, type FieldDefinition } from '../fields';
import { CHECKSUM_FIELD, HytekRecord } from './base';

export class DqDescriptionRecord extends HytekRecord {
  readonly identifier = 'H1';

  protected readonly fields: FieldDefinition[] = [
    {
      name: 'dqReasonCode',
      start: 3,
      length: 2,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.MANDATORY,
    },
    {
      name: 'description',
      start: 5,
      length: 124,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    CHECKSUM_FIELD,
  ];

  dqReasonCode!: string;
  description?: string;
  checksum?: string;

  constructor(data?: Partial<DqDescriptionRecord>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }
}
