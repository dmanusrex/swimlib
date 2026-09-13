/** Core HY3 configuration constants. */

/** Fixed length of each HY3 record (128 content characters + 2 checksum characters). */
export const RECORD_LENGTH = 130;

/** Number of content characters covered by the checksum (positions 1-128). */
export const CONTENT_LENGTH = 128;

/** Record separator in HY3 files. */
export const RECORD_SEP = '\r\n';

/** Default padding character for fields. */
export const FIELD_PADDING = ' ';
