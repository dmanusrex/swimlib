/** Base class for every error thrown by SwimLib. */
export class SwimLibError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

/** Base class for errors raised while parsing a file. */
export class SwimLibParseError extends SwimLibError {}

/** Base class for errors raised while building/serializing a file. */
export class SwimLibBuildError extends SwimLibError {}

/**
 * A non-fatal issue found while parsing (checksum mismatch, unknown record
 * type, truncated trailing data, ...). Parsers collect these instead of
 * throwing so callers can decide how strict to be.
 */
export interface SwimLibWarning {
  /** Stable machine-readable identifier, e.g. 'checksum-mismatch'. */
  code: string;
  /** Human-readable description of the issue. */
  message: string;
  /** 1-based line (text formats) or record/block index (binary formats), when known. */
  line?: number;
}
