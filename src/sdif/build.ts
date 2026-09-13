import { SwimLibBuildError } from '../core/errors';
import { RECORD_SEP } from './config';
import { type ValidationOptions } from './fields';
import { SdifRecord } from './records/base';
import { FileTerminatorRecord } from './records/terminator';
import type { SdifFile } from './parse';

export class SdifBuildError extends SwimLibBuildError {}

export interface SdifBuildOptions extends ValidationOptions {
  /** Skip validation entirely (defaults to validating every record). */
  validate?: boolean;
  /**
   * Append a Z0 terminator when the last record is not one (defaults to
   * true). The generated terminator copies organization/fileCode from the
   * A0 record when present.
   */
  appendTerminator?: boolean;
}

/**
 * Serialize records to SD3 content (CRLF-separated 160-character lines,
 * with a trailing CRLF).
 */
export function buildSdif(input: SdifRecord[] | SdifFile, options: SdifBuildOptions = {}): string {
  const records = Array.isArray(input) ? [...input] : [...input.records];
  if (records.length === 0) {
    throw new SdifBuildError('no records to build');
  }

  const validate = options.validate ?? true;
  if (validate) {
    for (const [index, record] of records.entries()) {
      const result = record.validate(options);
      if (!result.isValid) {
        const detail = result.errors.map((e) => e.message).join('; ');
        throw new SdifBuildError(
          `record ${index + 1} (${record.identifier}) failed validation: ${detail}`,
        );
      }
    }
  }

  if ((options.appendTerminator ?? true) && records.at(-1)?.identifier !== 'Z0') {
    const a0 = records.find((r) => r.identifier === 'A0');
    const terminator = new FileTerminatorRecord();
    if (a0 && 'organization' in a0 && 'fileCode' in a0) {
      terminator.organization = (a0 as FileTerminatorRecord).organization;
      terminator.fileCode = (a0 as FileTerminatorRecord).fileCode;
    }
    records.push(terminator);
  }

  return records.map((r) => r.toRecord()).join(RECORD_SEP) + RECORD_SEP;
}
