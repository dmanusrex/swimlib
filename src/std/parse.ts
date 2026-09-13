import { parseMmddyy } from '../core/dates';
import { SwimLibParseError, type SwimLibWarning } from '../core/errors';
import { decodeHytekTime } from '../core/hytek-timecodec';
import { decodeWindows1252 } from '../core/windows1252';
import {
  blockSizeForFormat,
  getHeaderPrefixField,
  getStandardPrefixField,
  HEADER_LAYOUT,
  labelCountForFormat,
  MAGIC,
  STANDARD_LAYOUT,
  TIME_KIND_ORDER,
  timeEntryOffset,
  TYPE_INDIVIDUAL,
  TYPE_RELAY,
  type StdFormat,
} from './layout';
import type { StdHeader, StdStandard, StdTimeMatrix } from './types';

export class StdParseError extends SwimLibParseError {}

function sliceField(frame: Uint8Array, offset: number, length: number): Uint8Array {
  return frame.subarray(offset, offset + length);
}

function parseAsciiField(frame: Uint8Array, offset: number, length: number): string {
  return decodeWindows1252(sliceField(frame, offset, length));
}

function parseRightJustifiedAge(text: string): string {
  return text.trimEnd() || text;
}

function emptyTimeMatrix(labelCount: number): StdTimeMatrix {
  const empty = Array.from({ length: labelCount }, () => 0);
  return {
    scmDqt: [...empty],
    lcmDqt: [...empty],
    scyDqt: [...empty],
    scmQt: [...empty],
    lcmQt: [...empty],
    scyQt: [...empty],
  };
}

/** Hy-Tek often pads unset time words with spaces or null bytes. */
function isEmptyTimeBytes(bytes: Uint8Array): boolean {
  return bytes.every((b) => b === 0x20) || bytes.every((b) => b === 0x00);
}

function parseTimeMatrix(timesRegion: Uint8Array, labelCount: number): StdTimeMatrix {
  const matrix = emptyTimeMatrix(labelCount);
  for (let kindIndex = 0; kindIndex < TIME_KIND_ORDER.length; kindIndex++) {
    const kind = TIME_KIND_ORDER[kindIndex]!;
    for (let labelIndex = 0; labelIndex < labelCount; labelIndex++) {
      const off = timeEntryOffset(kindIndex, labelIndex, labelCount);
      const bytes = timesRegion.subarray(off, off + 4);
      matrix[kind][labelIndex] = isEmptyTimeBytes(bytes) ? 0 : decodeHytekTime(bytes);
    }
  }
  return matrix;
}

function parseHeaderFrame(frame: Uint8Array, format: StdFormat): StdHeader {
  const layout = HEADER_LAYOUT[format];
  if (frame.length !== layout.blockSize) {
    throw new StdParseError(`header frame must be ${layout.blockSize} bytes`);
  }
  for (let i = 0; i < MAGIC.length; i++) {
    if (frame[i] !== MAGIC[i]) {
      throw new StdParseError(`missing 'STD' magic; got ${decodeWindows1252(frame.slice(0, 3))}`);
    }
  }

  const countField = getHeaderPrefixField('standardBlockCount');
  const dateField = getHeaderPrefixField('createdDate');
  const countRaw = parseAsciiField(frame, countField.offset, countField.length).trim();
  if (!/^\d+$/.test(countRaw)) {
    throw new StdParseError(`non-numeric standard block count ${JSON.stringify(countRaw)}`);
  }
  const standardBlockCount = Number(countRaw);
  if (standardBlockCount < 1) {
    throw new StdParseError(`standardBlockCount must be >= 1, got ${standardBlockCount}`);
  }

  const createdDate = parseMmddyy(parseAsciiField(frame, dateField.offset, dateField.length));

  const labels: string[] = [];
  const labelWidth = layout.labels.length / layout.labelCount;
  for (let i = 0; i < layout.labelCount; i++) {
    const off = layout.labels.offset + i * labelWidth;
    labels.push(parseAsciiField(frame, off, labelWidth).trim());
  }

  const yearIds: string[] = [];
  for (let i = 0; i < layout.yearSlotCount; i++) {
    const base = layout.firstYearOffset + i * layout.yearSlotStride;
    yearIds.push(parseAsciiField(frame, base, layout.yearId.length).trim());
  }

  const trailing = layout.trailingPad;
  const headerTrailingPad = new Uint8Array(sliceField(frame, trailing.offset, trailing.length));

  return {
    standardBlockCount,
    createdDate,
    labels,
    yearIds,
    headerTrailingPad,
  };
}

function parseStandardFrame(frame: Uint8Array, format: StdFormat): StdStandard {
  const layout = STANDARD_LAYOUT[format];
  const labelCount = labelCountForFormat(format);

  if (frame.length !== layout.blockSize) {
    throw new StdParseError(`standard frame must be ${layout.blockSize} bytes`);
  }

  const distanceField = getStandardPrefixField('distance');
  const lowerAgeField = getStandardPrefixField('lowerAge');
  const upperAgeField = getStandardPrefixField('upperAge');
  const typeFlagField = getStandardPrefixField('typeFlag');

  const gender = parseAsciiField(frame, 0, 1);
  const stroke = parseAsciiField(frame, 1, 1);
  const distance = parseAsciiField(frame, distanceField.offset, distanceField.length).trim();
  const lowerAge = parseRightJustifiedAge(
    parseAsciiField(frame, lowerAgeField.offset, lowerAgeField.length),
  );
  const upperAge = parseRightJustifiedAge(
    parseAsciiField(frame, upperAgeField.offset, upperAgeField.length),
  );
  const typeFlag = parseAsciiField(frame, typeFlagField.offset, 1);

  if (typeFlag !== TYPE_INDIVIDUAL && typeFlag !== TYPE_RELAY) {
    throw new StdParseError(`unknown type flag ${JSON.stringify(typeFlag)}`);
  }

  const timesRegion = sliceField(frame, layout.times.offset, layout.times.length);
  const times = parseTimeMatrix(timesRegion, labelCount);

  const standard: StdStandard = {
    gender,
    stroke,
    distance,
    lowerAge,
    upperAge,
    typeFlag,
    times,
    timesRegionRaw: new Uint8Array(timesRegion),
  };

  if (layout.trailingPad) {
    standard.blockTrailingPad = new Uint8Array(
      sliceField(frame, layout.trailingPad.offset, layout.trailingPad.length),
    );
  }

  return standard;
}

export interface ParseStdResult {
  header: StdHeader;
  standards: StdStandard[];
  warnings: SwimLibWarning[];
}

/** Parse a Hy-Tek time standards file. Caller must supply `format` (no auto-detection). */
export function parseStd(input: ArrayBuffer | Uint8Array, format: StdFormat): ParseStdResult {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  const blockSize = blockSizeForFormat(format);

  if (bytes.length < blockSize) {
    throw new StdParseError(`file too short for header: need at least ${blockSize} bytes`);
  }

  const warnings: SwimLibWarning[] = [];
  const header = parseHeaderFrame(bytes.subarray(0, blockSize), format);
  const logicalLength = header.standardBlockCount * blockSize;

  if (bytes.length < logicalLength) {
    throw new StdParseError(
      `truncated file: header declares ${header.standardBlockCount} blocks (${logicalLength} bytes) but input has ${bytes.length} bytes`,
    );
  }
  if (bytes.length > logicalLength) {
    warnings.push({
      code: 'trailing-data-ignored',
      message: `${bytes.length - logicalLength} bytes beyond the declared ${header.standardBlockCount} blocks were ignored`,
    });
  }

  const fileBytes = bytes.subarray(0, logicalLength);
  const standards: StdStandard[] = [];
  for (let i = 1; i < header.standardBlockCount; i++) {
    const off = i * blockSize;
    standards.push(parseStandardFrame(fileBytes.subarray(off, off + blockSize), format));
  }

  return { header, standards, warnings };
}

/** @deprecated Use {@link parseStd}. */
export const parseStdFile = parseStd;
/** @deprecated Use {@link ParseStdResult}. */
export type ParseStdFileResult = ParseStdResult;
