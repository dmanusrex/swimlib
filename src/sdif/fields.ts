/** Field metadata for fixed-width SDIF records. */

/** Available field types in SDIF records. */
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
} as const;
export type FieldType = (typeof FieldType)[keyof typeof FieldType];

/** Field requirement level in SDIF (the spec's M1/M2 flags). */
export const FieldRequirement = {
  /** M1 — mandatory in both SDIF v1 and v2 */
  MANDATORY_M1: 'm1',
  /** M2 — mandatory in SDIF v2 only */
  MANDATORY_M2: 'm2',
  /** Optional in both versions */
  OPTIONAL: 'optional',
} as const;
export type FieldRequirement = (typeof FieldRequirement)[keyof typeof FieldRequirement];

/** Validation options. */
export interface ValidationOptions {
  /**
   * Report missing M2 (SDIF v2) mandatory fields as warnings instead of
   * errors. M1 fields stay enforced as errors.
   */
  treatM2AsOptional?: boolean;
  /**
   * CL2 mode: turn off both M1 and M2 mandatory-field checks entirely. CL2
   * files predate SDIF v3 and may omit fields at either level. Set by
   * `parseCl2`.
   */
  cl2?: boolean;
}

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
  /** Starting position in record (1-based per SDIF spec). */
  start: number;
  /** Field length in characters. */
  length: number;
  /** Field data type. */
  type: FieldType;
  /** Field requirement level. */
  requirement: FieldRequirement;
  /** For CODE type fields, the code table to validate against. */
  codeType?: Record<string, string>;
  /** Custom validation function. */
  validate?: (value: unknown) => boolean;
}
