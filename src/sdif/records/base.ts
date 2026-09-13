/**
 * Base model implementation for SDIF records.
 *
 * Note on field positions: the SDIF specification uses 1-based positions
 * (e.g. organization code starts at position 3); JavaScript string indexing
 * is 0-based, so `field.start - 1` is used throughout.
 */

import { SwimLibParseError } from '../../core/errors';
import { SwimTime } from '../../core/swimtime';
import { FIELD_PADDING, RECORD_LENGTH } from '../config';
import {
  ErrorSeverity,
  FieldRequirement,
  FieldType,
  type FieldDefinition,
  type FieldError,
  type ValidationOptions,
  type ValidationResult,
} from '../fields';

export class SdifParseError extends SwimLibParseError {}

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

/** Validate a single field value against its definition. */
export function validateField(
  value: unknown,
  field: FieldDefinition,
  options: ValidationOptions = {},
): FieldError | null {
  if (value === undefined || value === null || value === '') {
    if (options.cl2) {
      return null;
    }
    if (field.requirement === FieldRequirement.MANDATORY_M1) {
      return {
        field: field.name,
        value,
        message: `Field ${field.name} is required`,
        severity: ErrorSeverity.ERROR,
      };
    }
    if (field.requirement === FieldRequirement.MANDATORY_M2) {
      return {
        field: field.name,
        value,
        message: `Field ${field.name} is required`,
        severity: options.treatM2AsOptional ? ErrorSeverity.WARNING : ErrorSeverity.ERROR,
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

/** Base interface for all SDIF models. */
export interface SdifModel {
  /** Convert to a 160-character SDIF record string. */
  toRecord(): string;
  /** Validate the model. */
  validate(options?: ValidationOptions): ValidationResult;
}

/** Base class for all SDIF record models. */
export abstract class SdifRecord implements SdifModel {
  /** Record type identifier (e.g. "A0", "B1"). */
  abstract readonly identifier: string;

  /** Field definitions for this record type. */
  protected abstract readonly fields: FieldDefinition[];

  /** Truncation warnings collected during the most recent toRecord(). */
  private truncationWarnings: FieldError[] = [];

  /** Field definitions (public read-only view, e.g. for field-map tests). */
  getFieldDefinitions(): readonly FieldDefinition[] {
    return this.fields;
  }

  /** Convert the model to a 160-character SDIF record string. */
  toRecord(): string {
    this.truncationWarnings = [];

    const record: string[] = new Array<string>(RECORD_LENGTH).fill(FIELD_PADDING);
    record[0] = this.identifier[0]!;
    record[1] = this.identifier[1]!;

    for (const field of this.fields) {
      const value = (this as unknown as Record<string, unknown>)[field.name];
      const formatted = this.formatFieldValue(value, field);
      for (let i = 0; i < field.length; i++) {
        record[field.start - 1 + i] = formatted[i] ?? FIELD_PADDING;
      }
    }

    return record.join('');
  }

  /** Validate the model. */
  validate(options?: ValidationOptions): ValidationResult {
    const issues: FieldError[] = [];

    for (const field of this.fields) {
      const value = (this as unknown as Record<string, unknown>)[field.name];
      const issue = validateField(value, field, options);
      if (issue) {
        issues.push(issue);
      }
    }

    const errors = issues.filter((e) => e.severity === ErrorSeverity.ERROR);
    return {
      isValid: errors.length === 0,
      errors,
      warnings: [
        ...issues.filter((e) => e.severity === ErrorSeverity.WARNING),
        ...this.truncationWarnings,
      ],
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
        return text.slice(0, field.length).padEnd(field.length, FIELD_PADDING);
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
          return value.format().padEnd(field.length, FIELD_PADDING);
        }
        return ''.padEnd(field.length, FIELD_PADDING);

      default:
        return stringifyFieldValue(value)
          .slice(0, field.length)
          .padEnd(field.length, FIELD_PADDING);
    }
  }

  /** Create a record instance from a raw SDIF line. */
  static fromRecord<T extends SdifRecord>(this: new () => T, record: string): T {
    const instance = new this();

    if (record.substring(0, 2) !== instance.identifier) {
      throw new SdifParseError(
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
      default:
        return trimmed;
    }
  }
}
