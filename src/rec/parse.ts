import { parseMmddyy, parseMmddyyWithCentury } from '../core/dates';
import { SwimLibParseError, type SwimLibWarning } from '../core/errors';
import { decodeHytekTime } from '../core/hytek-timecodec';
import { decodeWindows1252 } from '../core/windows1252';
import {
  DATA_FIELDS,
  DEFAULT_LSC_CODE,
  HEADER_FIELDS,
  HOLDER,
  MAGIC,
  RECORD_SIZE,
  TYPE_INDIVIDUAL,
  TYPE_RELAY,
} from './layout';
import type { RecDataRecord, RecHeader, RecIndividualRecord, RecRelayRecord } from './types';

export class RecParseError extends SwimLibParseError {}

function sliceField(frame: Uint8Array, offset: number, length: number): Uint8Array {
  return frame.slice(offset, offset + length);
}

function parseHeaderFrame(frame: Uint8Array): RecHeader {
  if (frame.length !== RECORD_SIZE) {
    throw new RecParseError(`header frame must be ${RECORD_SIZE} bytes`);
  }
  for (let i = 0; i < MAGIC.length; i++) {
    if (frame[i] !== MAGIC[i]) {
      throw new RecParseError(`missing 'REC' magic; got ${decodeWindows1252(frame.slice(0, 3))}`);
    }
  }

  const get = (name: string): Uint8Array => {
    const f = HEADER_FIELDS.find((x) => x.name === name);
    if (!f) throw new RecParseError(`unknown header field ${name}`);
    return sliceField(frame, f.offset, f.length);
  };

  const recordCountRaw = decodeWindows1252(get('recordCount')).trim();
  if (!/^\d+$/.test(recordCountRaw)) {
    throw new RecParseError(`non-numeric record count ${JSON.stringify(recordCountRaw)}`);
  }
  const recordCount = Number(recordCountRaw);
  const generationDate = parseMmddyy(decodeWindows1252(get('generationDate')));
  const courseCode = decodeWindows1252(get('courseCode'));
  const seasonTag = decodeWindows1252(get('seasonTag'));
  const setName = decodeWindows1252(get('setName')).replace(/\s+$/, '');
  const softwareSignature = decodeWindows1252(get('softwareSignature'));

  return {
    recordCount,
    generationDate,
    courseCode,
    seasonTag,
    setName,
    softwareSignature,
  };
}

function parseDataFrame(frame: Uint8Array): RecDataRecord {
  if (frame.length !== RECORD_SIZE) {
    throw new RecParseError(`data frame must be ${RECORD_SIZE} bytes`);
  }

  const get = (name: string): Uint8Array => {
    const f = DATA_FIELDS.find((x) => x.name === name);
    if (!f) throw new RecParseError(`unknown data field ${name}`);
    return sliceField(frame, f.offset, f.length);
  };

  const typeFlag = decodeWindows1252(get('typeFlag'));
  const eventCode = decodeWindows1252(get('eventCode'));
  const ageBand = decodeWindows1252(get('ageBand'));
  const holder = get('holder');
  const rawTimeBytes = new Uint8Array(get('timeBytes'));
  const seconds = decodeHytekTime(rawTimeBytes);
  const dateText = decodeWindows1252(get('date'));
  const recordCentury = decodeWindows1252(get('recordCentury'));
  const recordDate = parseMmddyyWithCentury(dateText, recordCentury);
  const lscCode = decodeWindows1252(get('lscCode')) || DEFAULT_LSC_CODE;
  const clubCode = decodeWindows1252(get('clubCode'));
  const timeType = decodeWindows1252(get('timeType'));
  const trailingPad = new Uint8Array(get('trailingPad'));

  const common = {
    eventCode,
    ageBand,
    seconds,
    recordDate,
    lscCode,
    clubCode,
    rawTimeBytes,
    timeType,
    recordCentury,
    trailingPad,
    holderRaw: decodeWindows1252(holder),
  };

  if (typeFlag === TYPE_INDIVIDUAL) {
    const ind = HOLDER.individualName;
    const team = HOLDER.individualTeam;
    const tail = HOLDER.individualTail;
    const rec: RecIndividualRecord = {
      typeFlag: 'I',
      ...common,
      swimmerName: decodeWindows1252(holder.slice(ind.start, ind.start + ind.length)),
      teamAffiliation: decodeWindows1252(holder.slice(team.start, team.start + team.length)),
      holderTail: new Uint8Array(holder.slice(tail.start, tail.start + tail.length)),
    };
    return rec;
  }

  if (typeFlag === TYPE_RELAY) {
    const team = HOLDER.relayTeam;
    const names = HOLDER.relayNames;
    const rec: RecRelayRecord = {
      typeFlag: 'R',
      ...common,
      teamLabel: decodeWindows1252(holder.slice(team.start, team.start + team.length)),
      relayNames: decodeWindows1252(holder.slice(names.start, names.start + names.length)),
    };
    return rec;
  }

  throw new RecParseError(`unknown type flag ${JSON.stringify(typeFlag)}`);
}

export interface ParseRecResult {
  header: RecHeader;
  records: RecDataRecord[];
  warnings: SwimLibWarning[];
}

/** Parse a full `.REC` byte stream into header + data records. */
export function parseRec(input: ArrayBuffer | Uint8Array): ParseRecResult {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  if (bytes.length % RECORD_SIZE !== 0) {
    throw new RecParseError(`file size ${bytes.length} is not a multiple of ${RECORD_SIZE}`);
  }
  const nFrames = bytes.length / RECORD_SIZE;
  if (nFrames === 0) {
    throw new RecParseError('file is empty');
  }
  const warnings: SwimLibWarning[] = [];
  const header = parseHeaderFrame(bytes.subarray(0, RECORD_SIZE));
  if (header.recordCount !== nFrames) {
    warnings.push({
      code: 'record-count-mismatch',
      message: `header says ${header.recordCount} frames but file has ${nFrames}`,
    });
  }
  const records: RecDataRecord[] = [];
  for (let i = 1; i < nFrames; i++) {
    const off = i * RECORD_SIZE;
    records.push(parseDataFrame(bytes.subarray(off, off + RECORD_SIZE)));
  }
  return { header, records, warnings };
}
