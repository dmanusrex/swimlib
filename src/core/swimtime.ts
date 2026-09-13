import { TimeCode } from './codes';

const TIME_CODES = new Set<string>(Object.values(TimeCode));

/**
 * A swimming time — either a duration in hundredths of a second or a
 * special code (NT, DQ, SCR, NS, FS, DNF). Used by the character-based
 * formats (SDIF, HY3); `fromCentiseconds`/`toCentiseconds` bridge to the
 * centisecond integers used by the EV3 module.
 */
export class SwimTime {
  // Seconds may exceed two digits: Hy-Tek HY3 writes times over a minute as
  // raw seconds (e.g. '138.08' = 2:18.08) rather than MM:SS.
  private static readonly TIME_REGEX = /^(?:(\d{1,2}):)?(\d{1,4})\.(\d{2})$/;
  private static readonly HUNDREDTHS_REGEX = /^\d+$/;

  private hundredths: number | null = null;
  private code: TimeCode | null = null;

  private constructor() {}

  /**
   * Parse `[MM:]SS.HH`, a bare hundredths integer, or a special code.
   * Input is trimmed first: real-world files (including native CL2 output)
   * pad times and time codes with leading/trailing whitespace.
   */
  static fromString(value: string): SwimTime {
    const time = new SwimTime();
    const trimmed = value.trim();

    if (TIME_CODES.has(trimmed)) {
      time.code = trimmed as TimeCode;
      return time;
    }

    const timeMatch = SwimTime.TIME_REGEX.exec(trimmed);
    if (timeMatch) {
      const minutes = timeMatch[1] ? parseInt(timeMatch[1], 10) : 0;
      const seconds = parseInt(timeMatch[2]!, 10);
      const hundredths = parseInt(timeMatch[3]!, 10);
      time.hundredths = minutes * 60 * 100 + seconds * 100 + hundredths;
      return time;
    }

    if (SwimTime.HUNDREDTHS_REGEX.test(trimmed)) {
      time.hundredths = parseInt(trimmed, 10);
      return time;
    }

    throw new RangeError(`Invalid time format: ${value}`);
  }

  /** Create a SwimTime from hundredths of a second. */
  static fromHundredths(hundredths: number): SwimTime {
    const time = new SwimTime();
    time.hundredths = hundredths;
    return time;
  }

  /** Alias of {@link fromHundredths} using EV3 terminology. */
  static fromCentiseconds(centiseconds: number): SwimTime {
    return SwimTime.fromHundredths(centiseconds);
  }

  /** Create a SwimTime holding a special time code. */
  static fromCode(code: TimeCode): SwimTime {
    const time = new SwimTime();
    time.code = code;
    return time;
  }

  /** True when this holds a special time code rather than a duration. */
  isCode(): boolean {
    return this.code !== null;
  }

  /** The time in hundredths of a second; throws for special codes. */
  getHundredths(): number {
    if (this.hundredths === null) {
      throw new RangeError('No time value available');
    }
    return this.hundredths;
  }

  /** Alias of {@link getHundredths} using EV3 terminology. */
  toCentiseconds(): number {
    return this.getHundredths();
  }

  /** The special time code; throws when this holds a duration. */
  getCode(): TimeCode {
    if (this.code === null) {
      throw new RangeError('No time code available');
    }
    return this.code;
  }

  /** Format in SDIF style: right-justified in 8 characters (codes left-justified). */
  format(): string {
    if (this.code) {
      return this.code.padEnd(8);
    }
    if (this.hundredths === null) {
      throw new RangeError('No time value available');
    }
    const totalSeconds = Math.floor(this.hundredths / 100);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const hundredths = this.hundredths % 100;
    const timeStr =
      minutes > 0
        ? `${minutes}:${seconds.toString().padStart(2, '0')}.${hundredths.toString().padStart(2, '0')}`
        : `${seconds}.${hundredths.toString().padStart(2, '0')}`;
    return timeStr.padStart(8);
  }

  /**
   * Compare two durations.
   * @returns negative if this < other, 0 if equal, positive if this > other
   * @throws RangeError if either side is a special code
   */
  compareTo(other: SwimTime): number {
    if (this.isCode() || other.isCode()) {
      throw new RangeError('Cannot compare times with special codes');
    }
    return this.getHundredths() - other.getHundredths();
  }
}
