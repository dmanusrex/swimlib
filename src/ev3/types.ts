/** Type definitions and code tables for the Hy-Tek EV3 event-file format. */

/** Course codes used in Hy-Tek EV3 session fields. */
export const Ev3CourseCode = {
  /** Long Course Meters (50m) */
  LCM: '1',
  /** Short Course Meters (25m) */
  SCM: '2',
  /** Short Course Yards (25y) */
  SCY: '3',
} as const;
export type Ev3CourseCode = (typeof Ev3CourseCode)[keyof typeof Ev3CourseCode];

/**
 * Stroke codes used in Hy-Tek EV3 files.
 *
 * Relays are NOT separate stroke codes: a relay event uses the base stroke
 * (A for free relay, E for medley relay) combined with `ind_or_relay: 'R'`
 * on the event record. F/G/H are diving events.
 */
export const Ev3StrokeCode = {
  FREESTYLE: 'A',
  BACKSTROKE: 'B',
  BREASTSTROKE: 'C',
  BUTTERFLY: 'D',
  INDIVIDUAL_MEDLEY: 'E',
  DIVING_1M: 'F',
  DIVING_3M: 'G',
  DIVING_10M: 'H',
} as const;
export type Ev3StrokeCode = (typeof Ev3StrokeCode)[keyof typeof Ev3StrokeCode];

/** Gender codes (normalized). */
export const Ev3Gender = {
  MALE: 'M',
  FEMALE: 'F',
} as const;
export type Ev3Gender = (typeof Ev3Gender)[keyof typeof Ev3Gender];

/** Individual or Relay indicator. */
export const Ev3EventCategory = {
  INDIVIDUAL: 'I',
  RELAY: 'R',
} as const;
export type Ev3EventCategory = (typeof Ev3EventCategory)[keyof typeof Ev3EventCategory];

/** Event type codes. */
export const Ev3EventType = {
  STANDARD: 'N',
  DISABILITY: 'D',
} as const;
export type Ev3EventType = (typeof Ev3EventType)[keyof typeof Ev3EventType];

/** Prelims/Finals indicator. */
export const Ev3PrelimsFinalsCode = {
  FINALS_ONLY: 'F',
  PRELIMS_AND_FINALS: 'P',
  TIMED_FINALS: 'T',
} as const;
export type Ev3PrelimsFinalsCode = (typeof Ev3PrelimsFinalsCode)[keyof typeof Ev3PrelimsFinalsCode];

/** Seeding type codes. */
export const Ev3SeedingType = {
  ALPHA: 'A',
  CIRCLE: 'C',
  COMPOSITE: 'O',
  EVENT_ENTRY: 'E',
  TIME: 'T',
} as const;
export type Ev3SeedingType = (typeof Ev3SeedingType)[keyof typeof Ev3SeedingType];

/** Meet class codes. */
export const Ev3MeetClass = {
  AGE_GROUP: 'A',
  OPEN: 'O',
  HIGH_SCHOOL: 'H',
  COLLEGE: 'C',
  YMCA: 'Y',
  MASTERS: 'M',
  DISABLED: 'D',
} as const;
export type Ev3MeetClass = (typeof Ev3MeetClass)[keyof typeof Ev3MeetClass];

/** ID Format codes. */
export const Ev3IdFormat = {
  USA: '1',
  NEW_ZEALAND: '2',
  SOUTH_AFRICA: '3',
  AUSTRALIAN_SWIMMING: '4',
  BRITISH_SWIMMING: '5',
  OTHER: '6',
  CANADA: '7',
  US_MASTERS: '8',
} as const;
export type Ev3IdFormat = (typeof Ev3IdFormat)[keyof typeof Ev3IdFormat];

/** Individual event record from an EV3 file. */
export interface Ev3Event {
  event_no: string;
  subevent_no: string;
  prelims_finals: string;
  rounds: string;
  ind_or_relay: string;
  gender: string;
  min_age: number;
  max_age: number;
  distance: string;
  stroke: string;
  number_of_dives: string;
  division_code: string;
  division_name: string;
  event_type: string;
  event_fee: string;

  /** Long Course Meters de-qualifying time (slower than). */
  lcm_dqt: string;
  /** Long Course Meters qualifying time (faster than). */
  lcm_qt: string;
  /** Computed: LCM de-qualifying time in centiseconds (output-only). */
  lcm_dqt_cs: number;
  /** Computed: LCM qualifying time in centiseconds (output-only). */
  lcm_qt_cs: number;

  scm_dqt: string;
  scm_qt: string;
  scm_dqt_cs: number;
  scm_qt_cs: number;

  scy_dqt: string;
  scy_qt: string;
  scy_dqt_cs: number;
  scy_qt_cs: number;

  session_number: string;
  session_event: string;
  session_meet_day: string;
  session_start_time: string;
  /** Hy-Tek course code (1=LCM, 2=SCM, 3=SCY). */
  session_course: string;

  max_entries: string;
  max_individual_entries: string;
  max_relay_entries: string;
  relay_team_members: string;
}

/** Meet header information from an EV3 file. */
export interface Ev3Header {
  meet_name: string;
  pool_name: string;
  meet_start_date: string;
  meet_end_date: string;
  age_up_date: string;
  seeding_type: string;
  team_surcharge: string;
  athlete_surcharge: string;
  facility_surcharge: string;
  file_format: string;
  meet_software: string;
  meet_sw_version: string;
  date_generated: string;
  unknown1: string;
  sanction_number: string;
  altitude: string;
  valid_times_start_date: string;
  minimum_age_open_events: string;
  max_total_entries: string;
  max_individual_entries: string;
  max_relay_entries: string;
  /** 1=USA, 2=NewZealand, 3=SouthAfrica, 4=Australian, 5=British, 6=Other, 7=Canada, 8=USMasters. */
  id_format: string;
  /** (A)gegroup, (O)pen, (H)ighSchool, (C)ollege, (Y)MCA, (M)asters, (D)isabled. */
  class: string;
  entry_deadline: string;
  pool_address1: string;
  pool_address2: string;
  pool_city: string;
  pool_province: string;
  pool_postal_code: string;
  pool_country: string;
  host_LSC: string;
  /** Require a time; NT entries are not allowed. */
  exclude_notimes: string;
  /** Hy-Tek MM > Seeding Preferences > Basic > last checkbox under course order. */
  use_min_conforming_course_time_if_qt_non_conforming: string;
  entry_open_date: string;
  /** Stored checksum over the rest of the header line. */
  check_digit: string;
}

/**
 * Decode an EV3 stroke code to its display name.
 *
 * Relay naming is derived from the base stroke plus the event's
 * `ind_or_relay` flag (e.g. stroke A + 'R' = free relay), so pass that flag
 * when decoding event strokes for display.
 */
export function decodeStroke(strokeCode: string, indOrRelay?: string): string {
  const strokeMap: Record<string, string> = {
    A: 'Free',
    B: 'Back',
    C: 'Breast',
    D: 'Fly',
    E: 'IM',
    F: 'Diving 1M',
    G: 'Diving 3M',
    H: 'Diving 10M',
  };
  const base = strokeMap[strokeCode.toUpperCase()] ?? strokeCode;
  if (indOrRelay?.toUpperCase() === 'R' && base !== strokeCode) {
    return base === 'IM' ? 'Medley Relay' : `${base} Relay`;
  }
  return base;
}
