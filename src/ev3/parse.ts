/**
 * EV3 event-file parser.
 *
 * The EV3 format is a semicolon-delimited text file: the first line is the
 * meet header (35 fields, ending in a check digit) and each subsequent line
 * is an event record (30 fields). There is no quoting in the format, so a
 * plain split is sufficient.
 */

import { SwimLibParseError, type SwimLibWarning } from '../core/errors';
import { decodeWindows1252 } from '../core/windows1252';
import { calculateEv3Checksum } from './checksum';
import { EVENT_FIELD_NAMES, HEADER_FIELD_NAMES } from './fields';
import type { Ev3Event, Ev3Header } from './types';
import { cleanField, normalizeGender, parseIntWithDefault, timeFromString } from './utils';

export class Ev3ParseError extends SwimLibParseError {}

export interface Ev3File {
  header: Ev3Header;
  events: Ev3Event[];
  warnings: SwimLibWarning[];
}

function parseEventRow(row: string[]): Ev3Event {
  const event: Record<string, string | number> = {};

  EVENT_FIELD_NAMES.forEach((fieldName, index) => {
    event[fieldName] = cleanField(row[index]);
  });

  event.min_age = parseIntWithDefault(event.min_age as string);
  event.max_age = parseIntWithDefault(event.max_age as string);

  event.gender = normalizeGender(event.gender as string);

  // Empty times normalize to '0.00'
  event.lcm_qt = (event.lcm_qt as string) || '0.00';
  event.lcm_dqt = (event.lcm_dqt as string) || '0.00';
  event.scm_qt = (event.scm_qt as string) || '0.00';
  event.scm_dqt = (event.scm_dqt as string) || '0.00';
  event.scy_qt = (event.scy_qt as string) || '0.00';
  event.scy_dqt = (event.scy_dqt as string) || '0.00';

  event.lcm_qt_cs = timeFromString(event.lcm_qt);
  event.lcm_dqt_cs = timeFromString(event.lcm_dqt);
  event.scm_qt_cs = timeFromString(event.scm_qt);
  event.scm_dqt_cs = timeFromString(event.scm_dqt);
  event.scy_qt_cs = timeFromString(event.scy_qt);
  event.scy_dqt_cs = timeFromString(event.scy_dqt);

  return event as unknown as Ev3Event;
}

function parseHeaderRow(row: string[]): Ev3Header {
  const header: Record<string, string> = {};
  HEADER_FIELD_NAMES.forEach((fieldName, index) => {
    header[fieldName] = cleanField(row[index]);
  });
  return header as unknown as Ev3Header;
}

/**
 * Parse EV3 content into header + events. Accepts a string or Windows-1252
 * encoded bytes. A checksum mismatch is reported as a warning
 * (code 'checksum-mismatch'), not an error.
 */
export function parseEv3(input: string | Uint8Array): Ev3File {
  const content = typeof input === 'string' ? input : decodeWindows1252(input);

  const lines = content.split(/\r?\n/).filter((line) => line.trim() !== '');
  if (lines.length === 0) {
    throw new Ev3ParseError('EV3 content is empty');
  }

  const warnings: SwimLibWarning[] = [];
  const rawHeaderLine = lines[0]!;
  const header = parseHeaderRow(rawHeaderLine.split(';'));

  // Validate the header checksum: strip the stored check_digit (final field)
  // before calculating so it is not included in the sum.
  const lastSeparatorIndex = rawHeaderLine.lastIndexOf(';');
  const headerLineWithoutChecksum =
    lastSeparatorIndex >= 0 ? rawHeaderLine.substring(0, lastSeparatorIndex) : rawHeaderLine;
  const calculatedChecksum = calculateEv3Checksum(headerLineWithoutChecksum);
  // Some files terminate the check digit with '*>'.
  const storedChecksum = header.check_digit.replace(/\*>\s*$/, '');

  if (calculatedChecksum === '') {
    warnings.push({
      code: 'checksum-unverifiable',
      message: 'Header line is too short to verify the EV3 checksum.',
      line: 1,
    });
  } else if (calculatedChecksum !== storedChecksum) {
    warnings.push({
      code: 'checksum-mismatch',
      message: `EV3 checksum mismatch. Calculated ${calculatedChecksum}, stored ${storedChecksum}.`,
      line: 1,
    });
  }

  const events: Ev3Event[] = [];
  for (let i = 1; i < lines.length; i++) {
    events.push(parseEventRow(lines[i]!.split(';')));
  }

  return { header, events, warnings };
}
