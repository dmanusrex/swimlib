/**
 * EV3 event-file writer.
 *
 * Serializes a header + events back to the semicolon-delimited EV3 format
 * with CRLF line endings (including a trailing CRLF, matching Hy-Tek
 * output). The header check digit is computed unless the caller opts to
 * preserve a stored one.
 */

import { SwimLibBuildError } from '../core/errors';
import { calculateEv3Checksum } from './checksum';
import { EVENT_FIELD_NAMES, HEADER_FIELD_NAMES } from './fields';
import type { Ev3Event, Ev3Header } from './types';

export class Ev3BuildError extends SwimLibBuildError {}

const LINE_SEP = '\r\n';

/** Time fields where '0.00' means "no time" and is written as empty. */
const TIME_FIELDS = new Set(['lcm_dqt', 'lcm_qt', 'scm_dqt', 'scm_qt', 'scy_dqt', 'scy_qt']);

/** Computed centisecond fields are output-only and never serialized. */
const HEADER_FIELDS_WITHOUT_CHECKSUM = HEADER_FIELD_NAMES.slice(0, -1);

export interface Ev3BuildOptions {
  /**
   * Write header.check_digit verbatim instead of computing the checksum.
   * Off by default; the checksum is normally derived from the content.
   */
  preserveCheckDigit?: boolean;
}

function fieldValue(source: Record<string, string | number | undefined>, name: string): string {
  const value = source[name];
  if (value === undefined || value === null) return '';
  const text = typeof value === 'string' ? value : String(value);
  if (text.includes(';') || /[\r\n]/.test(text)) {
    throw new Ev3BuildError(
      `field ${name}: value ${JSON.stringify(text)} contains a delimiter or line break`,
    );
  }
  return text;
}

/** Serialize the header line, computing the trailing check digit. */
export function buildHeaderLine(header: Ev3Header, options: Ev3BuildOptions = {}): string {
  const source = header as unknown as Record<string, string | number | undefined>;
  const fields = HEADER_FIELDS_WITHOUT_CHECKSUM.map((name) => fieldValue(source, name));
  const lineWithoutChecksum = fields.join(';');

  if (options.preserveCheckDigit) {
    return `${lineWithoutChecksum};${header.check_digit}`;
  }

  const checksum = calculateEv3Checksum(lineWithoutChecksum);
  if (checksum === '') {
    throw new Ev3BuildError(
      `header line is ${lineWithoutChecksum.length} characters; the EV3 checksum requires at least 128`,
    );
  }
  return `${lineWithoutChecksum};${checksum}`;
}

/** Serialize one event record line. */
export function buildEventLine(event: Ev3Event): string {
  const source = event as unknown as Record<string, string | number | undefined>;
  const fields = EVENT_FIELD_NAMES.map((name) => {
    const text = fieldValue(source, name);
    // Hy-Tek writes no-time qualifying fields as empty; the parser
    // normalizes empty to '0.00', so reverse that here.
    if (TIME_FIELDS.has(name) && text === '0.00') return '';
    return text;
  });
  return fields.join(';');
}

/**
 * Serialize a full EV3 file. The computed `*_cs` centisecond fields on
 * events are ignored; the string time fields are written.
 */
export function buildEv3(
  data: { header: Ev3Header; events: Ev3Event[] },
  options: Ev3BuildOptions = {},
): string {
  const lines = [buildHeaderLine(data.header, options)];
  for (const event of data.events) {
    lines.push(buildEventLine(event));
  }
  return lines.join(LINE_SEP) + LINE_SEP;
}
