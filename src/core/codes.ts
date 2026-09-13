/**
 * Code tables shared across formats. Format-specific tables (which often
 * assign conflicting meanings to the same letters) live in their own module.
 */

/** Special (non-numeric) time codes used by the character-based formats. */
export const TimeCode = {
  NO_TIME: 'NT',
  DISQUALIFIED: 'DQ',
  SCRATCH: 'SCR',
  NO_SHOW: 'NS',
  FALSE_START: 'FS',
  DID_NOT_FINISH: 'DNF',
} as const;
export type TimeCode = (typeof TimeCode)[keyof typeof TimeCode];
