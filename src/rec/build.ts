import { formatMmddyy, formatMmddyyWithCentury } from '../core/dates';
import { SwimLibBuildError } from '../core/errors';
import { encodeHytekTime } from '../core/hytek-timecodec';
import { encodeWindows1252 } from '../core/windows1252';
import {
  DATA_FIELDS,
  DEFAULT_LSC_CODE,
  DEFAULT_RECORD_CENTURY,
  DEFAULT_TIME_TYPE,
  HEADER_FIELDS,
  HOLDER,
  MAGIC,
  RECORD_SIZE,
} from './layout';
import type { RecDataRecord, RecHeader, RecIndividualRecord, RecRelayRecord } from './types';
import { defaultSetNameForCourse } from './types';

export class RecBuildError extends SwimLibBuildError {}

function windows1252Field(value: string, length: number, name: string): Uint8Array {
  if (value.length > length) {
    throw new RecBuildError(`field ${name}: value exceeds ${length} chars`);
  }
  const out = new Uint8Array(length);
  out.fill(0x20);
  out.set(encodeWindows1252(value, name), 0);
  return out;
}

function exactWindows1252(value: string, length: number, name: string): Uint8Array {
  if (value.length !== length) {
    throw new RecBuildError(`field ${name}: value must be exactly ${length} chars`);
  }
  return encodeWindows1252(value, name);
}

function resolveSetName(header: RecHeader): string {
  if (header.setName !== '') {
    return header.setName;
  }
  const d = defaultSetNameForCourse(header.courseCode);
  if (d === '') {
    throw new RecBuildError('setName is empty and courseCode is not L, S, or Y');
  }
  return d;
}

export function buildHeader(header: RecHeader): Uint8Array {
  if (header.recordCount < 1 || header.recordCount > 999) {
    throw new RecBuildError(`recordCount must be 1..999, got ${header.recordCount}`);
  }
  if (header.courseCode !== 'L' && header.courseCode !== 'S' && header.courseCode !== 'Y') {
    throw new RecBuildError(`invalid courseCode ${JSON.stringify(header.courseCode)}`);
  }

  const setName = resolveSetName(header);
  const out = new Uint8Array(RECORD_SIZE);
  out.fill(0x20);

  for (const f of HEADER_FIELDS) {
    let chunk: Uint8Array;
    switch (f.name) {
      case 'magic':
        chunk = MAGIC;
        break;
      case 'spaceAfterMagic':
        out[f.offset] = 0x20;
        continue;
      case 'recordCount':
        chunk = exactWindows1252(String(header.recordCount).padStart(3, ' '), f.length, f.name);
        break;
      case 'generationDate':
        chunk = exactWindows1252(formatMmddyy(header.generationDate), f.length, f.name);
        break;
      case 'spaceAfterDate':
        out[f.offset] = 0x20;
        continue;
      case 'courseCode':
        chunk = exactWindows1252(header.courseCode, f.length, f.name);
        break;
      case 'seasonTag':
        chunk = windows1252Field(header.seasonTag, f.length, f.name);
        break;
      case 'setName':
        chunk = windows1252Field(setName, f.length, f.name);
        break;
      case 'softwareSignature':
        chunk = windows1252Field(header.softwareSignature, f.length, f.name);
        break;
      case 'trailingPad':
        continue;
      default:
        throw new RecBuildError('unhandled header field');
    }
    out.set(chunk, f.offset);
  }
  return out;
}

function resolveTimeBytes(record: RecDataRecord): Uint8Array {
  if (record.rawTimeBytes !== undefined) {
    if (record.rawTimeBytes.length !== 4) {
      throw new RecBuildError('rawTimeBytes must be 4 bytes if provided');
    }
    return new Uint8Array(record.rawTimeBytes);
  }
  return encodeHytekTime(record.seconds);
}

function buildHolderIndividual(record: RecIndividualRecord): Uint8Array {
  const { individualName: na, individualTeam: te, individualTail: ta } = HOLDER;
  const name = windows1252Field(record.swimmerName, na.length, 'swimmerName');
  const team = windows1252Field(record.teamAffiliation, te.length, 'teamAffiliation');
  if (record.holderTail.length !== ta.length) {
    throw new RecBuildError(
      `holderTail must be ${ta.length} bytes, got ${record.holderTail.length}`,
    );
  }
  const out = new Uint8Array(na.length + te.length + ta.length);
  out.set(name, na.start);
  out.set(team, te.start);
  out.set(record.holderTail, ta.start);
  return out;
}

function buildHolderRelay(record: RecRelayRecord): Uint8Array {
  const { relayTeam: rt, relayNames: rn } = HOLDER;
  const team = windows1252Field(record.teamLabel, rt.length, 'teamLabel');
  const names = windows1252Field(record.relayNames, rn.length, 'relayNames');
  const out = new Uint8Array(rt.length + rn.length);
  out.set(team, rt.start);
  out.set(names, rn.start);
  return out;
}

function buildHolderRaw(holderRaw: string): Uint8Array {
  return exactWindows1252(holderRaw, 80, 'holderRaw');
}

export function buildDataRecord(record: RecDataRecord): Uint8Array {
  const out = new Uint8Array(RECORD_SIZE);
  out.fill(0x20);
  const { mmddyy, century } = formatMmddyyWithCentury(record.recordDate);
  const resolvedLscCode = record.lscCode === '' ? DEFAULT_LSC_CODE : record.lscCode;
  const resolvedTimeType = record.timeType === '' ? DEFAULT_TIME_TYPE : record.timeType;
  const resolvedCentury = record.recordCentury === '' ? century : record.recordCentury;

  for (const f of DATA_FIELDS) {
    switch (f.name) {
      case 'eventCode':
        out.set(windows1252Field(record.eventCode, f.length, f.name), f.offset);
        break;
      case 'ageBand':
        out.set(windows1252Field(record.ageBand, f.length, f.name), f.offset);
        break;
      case 'typeFlag':
        out.set(exactWindows1252(record.typeFlag, f.length, f.name), f.offset);
        break;
      case 'holder': {
        const holder =
          record.holderRaw !== undefined
            ? buildHolderRaw(record.holderRaw)
            : record.typeFlag === 'I'
              ? buildHolderIndividual(record)
              : buildHolderRelay(record);
        out.set(holder, f.offset);
        break;
      }
      case 'date':
        out.set(exactWindows1252(mmddyy, f.length, f.name), f.offset);
        break;
      case 'timeBytes':
        out.set(resolveTimeBytes(record), f.offset);
        break;
      case 'lscCode':
        out.set(windows1252Field(resolvedLscCode, f.length, f.name), f.offset);
        break;
      case 'clubCode':
        out.set(windows1252Field(record.clubCode, f.length, f.name), f.offset);
        break;
      case 'timeType':
        out.set(exactWindows1252(resolvedTimeType, f.length, f.name), f.offset);
        break;
      case 'recordCentury':
        out.set(
          exactWindows1252(resolvedCentury || DEFAULT_RECORD_CENTURY, f.length, f.name),
          f.offset,
        );
        break;
      case 'trailingPad': {
        if (record.trailingPad.length !== f.length) {
          throw new RecBuildError(
            `trailingPad must be ${f.length} bytes, got ${record.trailingPad.length}`,
          );
        }
        out.set(record.trailingPad, f.offset);
        break;
      }
      default:
        throw new RecBuildError('unhandled data field');
    }
  }

  return out;
}

/** Serialize header + data records to a `.REC` byte stream. */
export function buildRec(header: RecHeader, records: RecDataRecord[]): Uint8Array {
  const expected = records.length + 1;
  if (header.recordCount !== expected) {
    throw new RecBuildError(
      `header.recordCount=${header.recordCount} but got ${records.length} data records (expected ${expected} including header)`,
    );
  }
  const parts: Uint8Array[] = [buildHeader(header)];
  for (const r of records) {
    parts.push(buildDataRecord(r));
  }
  const total = parts.reduce((a, p) => a + p.length, 0);
  const out = new Uint8Array(total);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}
