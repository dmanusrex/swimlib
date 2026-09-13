/** Field metadata for fixed-width HY3 records. */

/** Available field types in HY3 records. */
export const FieldType = {
  /** Alphanumeric data */
  ALPHA: 'alpha',
  /** Code values from defined tables */
  CODE: 'code',
  /** Date values (MMDDYYYY) */
  DATE: 'date',
  /** Decimal numbers */
  DECIMAL: 'decimal',
  /** Integer numbers */
  INTEGER: 'integer',
  /** Boolean values (T/F) */
  LOGICAL: 'logical',
  /** Names (special alpha type) */
  NAME: 'name',
  /** Phone numbers */
  PHONE: 'phone',
  /** Postal codes */
  POSTAL_CODE: 'postal',
  /** US state codes */
  USPS: 'usps',
  /** USS numbers */
  USS_NUM: 'ussnum',
  /** Time values or time codes */
  TIME: 'time',
  /**
   * Record checksum (the last 2 characters of every line). Never formatted
   * from a property — toRecord() computes it over the first 128 characters.
   */
  CHECKSUM: 'checksum',
} as const;
export type FieldType = (typeof FieldType)[keyof typeof FieldType];

/**
 * Field requirement level. HY3 uses a simple two-level model (unlike SDIF's
 * three-level v1/v2 split).
 */
export const FieldRequirement = {
  MANDATORY: 'm',
  OPTIONAL: 'optional',
} as const;
export type FieldRequirement = (typeof FieldRequirement)[keyof typeof FieldRequirement];

/** Field error severity. */
export const ErrorSeverity = {
  ERROR: 'error',
  WARNING: 'warning',
} as const;
export type ErrorSeverity = (typeof ErrorSeverity)[keyof typeof ErrorSeverity];

/** Field validation error. */
export interface FieldError {
  field: string;
  value: unknown;
  message: string;
  severity: ErrorSeverity;
}

/** Record validation result. */
export interface ValidationResult {
  isValid: boolean;
  errors: FieldError[];
  warnings: FieldError[];
}

/** Field definition. */
export interface FieldDefinition {
  /** Field name (matches property name in model). */
  name: string;
  /** Starting position in record (1-based, following the SDIF convention). */
  start: number;
  /** Field length in characters. */
  length: number;
  /** Field data type. */
  type: FieldType;
  /** Field requirement level. */
  requirement: FieldRequirement;
  /** For CODE type fields, the code table to validate against. */
  codeType?: Record<string, string>;
  /**
   * Justification for text-like fields (ALPHA/NAME/USPS/POSTAL_CODE/
   * USS_NUM/PHONE). Defaults to 'left'. Real Hy-Tek TM8 output
   * right-justifies numeric-in-text columns (swimmer ids, ages, fees,
   * event numbers, the A1 creation time).
   */
  justify?: 'left' | 'right';
  /** Custom validation function. */
  validate?: (value: unknown) => boolean;
}
