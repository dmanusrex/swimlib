import { SwimLibBuildError } from '../core/errors';
import { RECORD_SEP } from './config';
import { HytekRecord } from './records/base';
import type { Hy3File } from './parse';

export class Hy3BuildError extends SwimLibBuildError {}

/**
 * Serialize records to HY3 content: CRLF-separated 130-character lines with
 * a trailing CRLF. Each record is serialized via toRecord(), which computes
 * and embeds the line checksum.
 */
export function buildHy3(input: HytekRecord[] | Hy3File): string {
  const records = Array.isArray(input) ? input : input.records;
  if (records.length === 0) {
    throw new Hy3BuildError('no records to build');
  }

  return records.map((r) => r.toRecord()).join(RECORD_SEP) + RECORD_SEP;
}
