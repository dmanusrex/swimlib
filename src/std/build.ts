import { formatMmddyy } from '../core/dates';
import { SwimLibBuildError } from '../core/errors';
import { encodeHytekTime } from '../core/hytek-timecodec';
import { encodeWindows1252 } from '../core/windows1252';
import {
  blockSizeForFormat,
  getHeaderPrefixField,
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
import type { StdHeader, StdStandard } from './types';

export class StdBuildError extends SwimLibBuildError {}

function windows1252Field(
  value: string,
  length: number,
  name: string,
  pad: 'left' | 'right',
): Uint8Array {
  if (value.length > length) {
    throw new StdBuildError(`field ${name}: value exceeds ${length} chars`);
  }
  const padded = pad === 'right' ? value.padStart(length, ' ') : value.padEnd(length, ' ');
  return encodeWindows1252(padded, name);
}

function exactWindows1252(value: string, length: number, name: string): Uint8Array {
  if (value.length !== length) {
    throw new StdBuildError(`field ${name}: value must be exactly ${length} chars`);
  }
  return encodeWindows1252(value, name);
}

function validateHeader(header: StdHeader, format: StdFormat): void {
  const labelCount = labelCountForFormat(format);
  if (header.standardBlockCount < 1 || header.standardBlockCount > 9999) {
    throw new StdBuildError(`standardBlockCount must be 1..9999, got ${header.standardBlockCount}`);
  }
  if (header.labels.length !== labelCount) {
    throw new StdBuildError(`labels must have length ${labelCount}`);
  }
  if (header.yearIds.length !== labelCount) {
    throw new StdBuildError(`yearIds must have length ${labelCount}`);
  }
  const trailing = HEADER_LAYOUT[format].trailingPad;
  if (
    header.headerTrailingPad !== undefined &&
    header.headerTrailingPad.length !== trailing.length
  ) {
    throw new StdBuildError(`headerTrailingPad must be ${trailing.length} bytes`);
  }
}

function validateStandard(standard: StdStandard, format: StdFormat): void {
  const labelCount = labelCountForFormat(format);
  if (standard.typeFlag !== TYPE_INDIVIDUAL && standard.typeFlag !== TYPE_RELAY) {
    throw new StdBuildError(`invalid typeFlag ${JSON.stringify(standard.typeFlag)}`);
  }
  for (const kind of TIME_KIND_ORDER) {
    if (standard.times[kind].length !== labelCount) {
      throw new StdBuildError(`times.${kind} must have length ${labelCount}`);
    }
  }
  const timesLayout = STANDARD_LAYOUT[format].times;
  if (
    standard.timesRegionRaw !== undefined &&
    standard.timesRegionRaw.length !== timesLayout.length
  ) {
    throw new StdBuildError(`timesRegionRaw must be ${timesLayout.length} bytes`);
  }
  const blockPad = STANDARD_LAYOUT[format].trailingPad;
  if (
    blockPad &&
    standard.blockTrailingPad !== undefined &&
    standard.blockTrailingPad.length !== blockPad.length
  ) {
    throw new StdBuildError(`blockTrailingPad must be ${blockPad.length} bytes`);
  }
}

export function buildHeader(header: StdHeader, format: StdFormat): Uint8Array {
  validateHeader(header, format);
  const layout = HEADER_LAYOUT[format];
  const out = new Uint8Array(layout.blockSize);
  out.fill(0x20);

  out.set(MAGIC, 0);
  const countField = getHeaderPrefixField('standardBlockCount');
  const countText = String(header.standardBlockCount).padStart(countField.length, '0');
  out.set(exactWindows1252(countText, countField.length, 'standardBlockCount'), countField.offset);
  const dateField = getHeaderPrefixField('createdDate');
  out.set(
    exactWindows1252(formatMmddyy(header.createdDate), dateField.length, 'createdDate'),
    dateField.offset,
  );

  const labelWidth = layout.labels.length / layout.labelCount;
  for (let i = 0; i < layout.labelCount; i++) {
    const off = layout.labels.offset + i * labelWidth;
    out.set(windows1252Field(header.labels[i] ?? '', labelWidth, `labels[${i}]`, 'right'), off);
  }

  for (let i = 0; i < layout.yearSlotCount; i++) {
    const base = layout.firstYearOffset + i * layout.yearSlotStride;
    const year = header.yearIds[i] ?? '';
    out.set(windows1252Field(year, layout.yearId.length, `yearIds[${i}]`, 'right'), base);
  }

  const trailing = layout.trailingPad;
  if (header.headerTrailingPad !== undefined) {
    out.set(header.headerTrailingPad, trailing.offset);
  }

  return out;
}

function buildTimesRegion(standard: StdStandard, format: StdFormat): Uint8Array {
  const layout = STANDARD_LAYOUT[format];
  if (standard.timesRegionRaw !== undefined) {
    return new Uint8Array(standard.timesRegionRaw);
  }

  const labelCount = labelCountForFormat(format);
  const out = new Uint8Array(layout.times.length);
  out.fill(0x20);

  for (let kindIndex = 0; kindIndex < TIME_KIND_ORDER.length; kindIndex++) {
    const kind = TIME_KIND_ORDER[kindIndex]!;
    for (let labelIndex = 0; labelIndex < labelCount; labelIndex++) {
      const seconds = standard.times[kind][labelIndex] ?? 0;
      if (seconds > 0) {
        out.set(encodeHytekTime(seconds), timeEntryOffset(kindIndex, labelIndex, labelCount));
      }
    }
  }

  return out;
}

export function buildStandardBlock(standard: StdStandard, format: StdFormat): Uint8Array {
  validateStandard(standard, format);
  const layout = STANDARD_LAYOUT[format];
  const out = new Uint8Array(layout.blockSize);
  out.fill(0x20);

  out.set(exactWindows1252(standard.gender, 1, 'gender'), 0);
  out.set(exactWindows1252(standard.stroke, 1, 'stroke'), 1);
  out.set(windows1252Field(standard.distance, 4, 'distance', 'left'), 2);
  out.set(windows1252Field(standard.lowerAge, 2, 'lowerAge', 'right'), 6);
  out.set(windows1252Field(standard.upperAge, 2, 'upperAge', 'right'), 8);
  out.set(exactWindows1252(standard.typeFlag, 1, 'typeFlag'), 10);

  const timesRegion = buildTimesRegion(standard, format);
  out.set(timesRegion, layout.times.offset);

  if (layout.trailingPad && standard.blockTrailingPad !== undefined) {
    out.set(standard.blockTrailingPad, layout.trailingPad.offset);
  }

  return out;
}

/** Serialize header + standards to a `.ST2` / `.STD` byte stream (no trailing junk). */
export function buildStd(
  header: StdHeader,
  standards: StdStandard[],
  format: StdFormat,
): Uint8Array {
  const expected = standards.length + 1;
  if (header.standardBlockCount !== expected) {
    throw new StdBuildError(
      `header.standardBlockCount=${header.standardBlockCount} but got ${standards.length} standard blocks (expected ${expected} including header)`,
    );
  }

  const blockSize = blockSizeForFormat(format);
  const parts: Uint8Array[] = [buildHeader(header, format)];
  for (const s of standards) {
    parts.push(buildStandardBlock(s, format));
  }

  const total = parts.reduce((a, p) => a + p.length, 0);
  if (total !== header.standardBlockCount * blockSize) {
    throw new StdBuildError(
      `internal size mismatch: ${total} vs ${header.standardBlockCount * blockSize}`,
    );
  }

  const out = new Uint8Array(total);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

/** @deprecated Use {@link buildStd}. */
export const buildStdFile = buildStd;
