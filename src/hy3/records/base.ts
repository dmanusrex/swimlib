/**
 * Base model implementation for HY3 records.
 *
 * Note on field positions: field definitions use 1-based positions
 * (following the SDIF convention the format descends from); JavaScript
 * string indexing is 0-based, so `field.start - 1` is used throughout.
 *
 * Every serialized line is 130 characters: 128 characters of content plus a
 * 2-character checksum. CHECKSUM fields are never formatted from properties;
 * toRecord() computes the checksum over the first 128 characters and writes
 * it to the final two positions.
 */

import { SwimLibParseError } from '../../core/errors';
import { SwimTime } from '../../core/swimtime';
import { computeHy3Checksum } from '../checksum';
import { FIELD_PADDING, RECORD_LENGTH } from '../config';
import {
  ErrorSeverity,
  FieldRequirement,
  FieldType,
  type FieldDefinition,
  type FieldError,
  type ValidationResult,
} from '../fields';

export class Hy3ParseError extends SwimLibParseError {}

/**
 * The checksum field common to every HY3 record type: the last two
 * characters of the 130-character line (positions 129-130, 1-based). It is
 * OPTIONAL because it is derived — toRecord() always computes and embeds it,
 * and fromRecord() stores the raw value found on the line.
 */
export const CHECKSUM_FIELD: FieldDefinition = {
  name: 'checksum',
  start: 129,
  length: 2,
  type: FieldType.CHECKSUM,
  requirement: FieldRequirement.OPTIONAL,
};

/**
 * Stringify a field value for fixed-width output. Field values are strings,
 * numbers, booleans, or Dates set by callers; anything else stringifies via
 * JSON to avoid '[object Object]'.
 */
export function stringifyFieldValue(value: unknown): string {
  switch (typeof value) {
    case 'string':
      return value;
    case 'number':
    case 'boolean':
    case 'bigint':
      return String(value);
    default:
      if (value instanceof Date) return value.toISOString();
      return JSON.stringify(value) ?? '';
  }
}

/**
 * Format a SwimTime the way Hy-Tek writes times in HY3 files: raw seconds
 * with two decimals, never minute-formatted ('138.08' rather than
 * '2:18.08'). Validated against real TM8 exports (E2 '64.93', F2 '77.68',
 * G1 splits, F1 seed '133.53'). Special codes (NT, DQ, …) are returned
 * as-is (callers right-justify).
 */
export function formatHy3Time(time: SwimTime): string {
  if (time.isCode()) return time.getCode();
  const hundredths = time.getHundredths();
  return `${Math.floor(hundredths / 100)}.${String(hundredths % 100).padStart(2, '0')}`;
}

/** Validate a single field value against its definition. */
export function validateField(value: unknown, field: FieldDefinition): FieldError | null {
  if (value === undefined || value === null || value === '') {
    if (field.requirement === FieldRequirement.MANDATORY) {
      return {
        field: field.name,
        value,
        message: `Field ${field.name} is required`,
        severity: ErrorSeverity.ERROR,
      };
    }
    return null;
  }

  if (field.validate && !field.validate(value)) {
    return {
      field: field.name,
      value,
      message: `Field ${field.name} failed custom validation`,
      severity: ErrorSeverity.ERROR,
    };
  }

  return validateFieldType(value, field);
}

function validateFieldType(value: unknown, field: FieldDefinition): FieldError | null {
  switch (field.type) {
    case FieldType.INTEGER:
      if (!Number.isInteger(Number(value))) {
        return err(field, value, `Field ${field.name} must be an integer`);
      }
      break;
    case FieldType.DECIMAL:
      if (isNaN(Number(value))) {
        return err(field, value, `Field ${field.name} must be a number`);
      }
      break;
    case FieldType.DATE:
      if (!(value instanceof Date) || isNaN(value.getTime())) {
        return err(field, value, `Field ${field.name} must be a valid date`);
      }
      break;
    case FieldType.LOGICAL:
      if (typeof value !== 'boolean') {
        return err(field, value, `Field ${field.name} must be a boolean`);
      }
      break;
    case FieldType.CODE:
      if (field.codeType && !Object.values(field.codeType).includes(value as string)) {
        return err(field, value, `Invalid code value for field ${field.name}`);
      }
      break;
    case FieldType.TIME:
      if (!(value instanceof SwimTime)) {
        return err(field, value, `Field ${field.name} must be a SwimTime instance`);
      }
      break;
  }
  return null;
}

function err(field: FieldDefinition, value: unknown, message: string): FieldError {
  return { field: field.name, value, message, severity: ErrorSeverity.ERROR };
}

/** Base interface for all HY3 models. */
export interface HytekModel {
  /** Convert to a 130-character HY3 record string (checksum included). */
  toRecord(): string;
  /** Validate the model. */
  validate(): ValidationResult;
}

/** Base class for all HY3 record models. */
export abstract class HytekRecord implements HytekModel {
  /** Record type identifier (e.g. "A1", "B1"). */
  abstract readonly identifier: string;

  /** Field definitions for this record type. */
  protected abstract readonly fields: FieldDefinition[];

  /** Truncation warnings collected during the most recent toRecord(). */
  private truncationWarnings: FieldError[] = [];

  /** Field definitions (public read-only view, e.g. for field-map tests). */
  getFieldDefinitions(): readonly FieldDefinition[] {
    return this.fields;
  }

  /**
   * Convert the model to a 130-character HY3 record string. The checksum is
   * computed over the first 128 characters and embedded in the last two.
   */
  toRecord(): string {
    this.truncationWarnings = [];

    const record: string[] = new Array<string>(RECORD_LENGTH).fill(FIELD_PADDING);
    record[0] = this.identifier[0]!;
    record[1] = this.identifier[1]!;

    for (const field of this.fields) {
      // The checksum is derived from the full line content, never formatted
      // from a property (the old library let CHECKSUM fall through to
      // default string handling — its biggest bug).
      if (field.type === FieldType.CHECKSUM) continue;

      const value = (this as unknown as Record<string, unknown>)[field.name];
      const formatted = this.formatFieldValue(value, field);
      for (let i = 0; i < field.length; i++) {
        record[field.start - 1 + i] = formatted[i] ?? FIELD_PADDING;
      }
    }

    const checksum = computeHy3Checksum(record.join(''));
    record[RECORD_LENGTH - 2] = checksum[0]!;
    record[RECORD_LENGTH - 1] = checksum[1]!;

    return record.join('');
  }

  /** Validate the model. CHECKSUM fields are derived and therefore skipped. */
  validate(): ValidationResult {
    const errors: FieldError[] = [];

    for (const field of this.fields) {
      if (field.type === FieldType.CHECKSUM) continue;
      const value = (this as unknown as Record<string, unknown>)[field.name];
      const error = validateField(value, field);
      if (error) {
        errors.push(error);
      }
    }

    return {
      isValid: !errors.some((e) => e.severity === ErrorSeverity.ERROR),
      errors: errors.filter((e) => e.severity === ErrorSeverity.ERROR),
      warnings: [...this.truncationWarnings],
    };
  }

  /** Format a field value, tracking truncation warnings. */
  protected formatFieldValue(value: unknown, field: FieldDefinition): string {
    if (value === undefined || value === null) {
      return ''.padEnd(field.length, FIELD_PADDING);
    }

    switch (field.type) {
      case FieldType.ALPHA:
      case FieldType.NAME:
      case FieldType.USPS:
      case FieldType.POSTAL_CODE:
      case FieldType.USS_NUM:
      case FieldType.PHONE: {
        const text = stringifyFieldValue(value);
        if (text.length > field.length) {
          this.truncationWarnings.push({
            field: field.name,
            value,
            message: `Value truncated from ${text.length} to ${field.length} characters`,
            severity: ErrorSeverity.WARNING,
          });
        }
        const clipped = text.slice(0, field.length);
        return field.justify === 'right'
          ? clipped.padStart(field.length, FIELD_PADDING)
          : clipped.padEnd(field.length, FIELD_PADDING);
      }

      case FieldType.INTEGER:
        return String(parseInt(stringifyFieldValue(value), 10)).padStart(
          field.length,
          FIELD_PADDING,
        );

      case FieldType.DECIMAL:
        return String(parseFloat(stringifyFieldValue(value))).padStart(field.length, FIELD_PADDING);

      case FieldType.DATE:
        if (value instanceof Date) {
          const month = (value.getUTCMonth() + 1).toString().padStart(2, '0');
          const day = value.getUTCDate().toString().padStart(2, '0');
          const year = value.getUTCFullYear().toString();
          return `${month}${day}${year}`.padEnd(field.length, FIELD_PADDING);
        }
        return ''.padEnd(field.length, FIELD_PADDING);

      case FieldType.LOGICAL:
        return (value ? 'T' : 'F').padEnd(field.length, FIELD_PADDING);

      case FieldType.CODE:
        if (field.codeType) {
          return stringifyFieldValue(value).padEnd(field.length, FIELD_PADDING);
        }
        return ''.padEnd(field.length, FIELD_PADDING);

      case FieldType.TIME:
        if (value instanceof SwimTime) {
          // Hy-Tek writes times as raw seconds, right-justified (HY3 uses
          // both 7- and 8-character time columns).
          return formatHy3Time(value).padStart(field.length, FIELD_PADDING);
        }
        return ''.padEnd(field.length, FIELD_PADDING);

      case FieldType.CHECKSUM:
        // Computed in toRecord(); never formatted from a value.
        return ''.padEnd(field.length, FIELD_PADDING);

      default:
        return stringifyFieldValue(value)
          .slice(0, field.length)
          .padEnd(field.length, FIELD_PADDING);
    }
  }

  /**
   * Create a record instance from a raw HY3 line. The stored checksum is
   * captured as-is into the record's checksum property; verification against
   * the recomputed value is the parser's job (see parse.ts).
   */
  static fromRecord<T extends HytekRecord>(this: new () => T, record: string): T {
    const instance = new this();

    if (record.substring(0, 2) !== instance.identifier) {
      throw new Hy3ParseError(
        `Invalid record type: expected ${instance.identifier}, got ${record.substring(0, 2)}`,
      );
    }

    for (const field of instance.fields) {
      const value = record.substring(field.start - 1, field.start - 1 + field.length);
      (instance as unknown as Record<string, unknown>)[field.name] = instance.parseFieldValue(
        value,
        field,
      );
    }

    return instance;
  }

  /** Parse a raw field slice into a typed value. */
  protected parseFieldValue(value: string, field: FieldDefinition): unknown {
    const trimmed = value.trim();
    if (!trimmed) return null;

    switch (field.type) {
      case FieldType.INTEGER:
        return parseInt(trimmed, 10);
      case FieldType.DECIMAL:
        return parseFloat(trimmed);
      case FieldType.DATE:
        if (trimmed.length === 8) {
          const month = parseInt(trimmed.substring(0, 2), 10) - 1;
          const day = parseInt(trimmed.substring(2, 4), 10);
          const year = parseInt(trimmed.substring(4, 8), 10);
          return new Date(Date.UTC(year, month, day));
        }
        return null;
      case FieldType.LOGICAL:
        return trimmed === 'T';
      case FieldType.CODE:
        return field.codeType ? trimmed : null;
      case FieldType.TIME:
        return SwimTime.fromString(trimmed);
      case FieldType.CHECKSUM:
        // Keep the raw stored checksum; it is not recomputed here.
        return trimmed;
      default:
        return trimmed;
    }
  }
}
