/**
 * HY3 filler record (DC).
 *
 * The payload occupies columns 2-127. Parsing accepts its contents for
 * compatibility, while serialization emits a blank payload.
 */
import { type FieldDefinition } from '../fields';
import { CHECKSUM_FIELD, HytekRecord } from './base';

export class FillerRecord extends HytekRecord {
  readonly identifier = 'DC';

  protected readonly fields: FieldDefinition[] = [CHECKSUM_FIELD];

  checksum?: string;

  constructor(data?: Partial<FillerRecord>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }
}
