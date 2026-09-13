/**
 * SDIF code tables (SDIF v3 spec code numbers noted per table).
 * All tables are as-const objects; the derived union types accept the raw
 * string codes as parsed from files.
 */

export { TimeCode } from '../core/codes';

/** Organization codes (ORG Code 001). */
export const OrganizationCode = {
  USS: '1',
  MASTERS: '2',
  NCAA: '3',
  NCAA_DIV_I: '4',
  NCAA_DIV_II: '5',
  NCAA_DIV_III: '6',
  YMCA: '7',
  FINA: '8',
  HIGH_SCHOOL: '9',
} as const;
export type OrganizationCode = (typeof OrganizationCode)[keyof typeof OrganizationCode];

/** File/Transmission Type codes (FILE Code 003). */
export const FileCode = {
  MEET_REGISTRATIONS: '01',
  MEET_RESULTS: '02',
  OVC: '03',
  NATIONAL_AGE_GROUP_RECORD: '04',
  LSC_AGE_GROUP_RECORD: '05',
  LSC_MOTIVATIONAL_LIST: '06',
  NATIONAL_RECORDS_AND_RANKINGS: '07',
  TEAM_SELECTION: '08',
  LSC_BEST_TIMES: '09',
  USS_REGISTRATION: '10',
  TOP_16: '16',
  VENDOR_DEFINED: '20',
} as const;
export type FileCode = (typeof FileCode)[keyof typeof FileCode];

/** Meet Type codes (MEET Code 005). */
export const MeetTypeCode = {
  INVITATIONAL: '1',
  REGIONAL: '2',
  LSC_CHAMPIONSHIP: '3',
  ZONE: '4',
  ZONE_CHAMPIONSHIP: '5',
  NATIONAL_CHAMPIONSHIP: '6',
  JUNIORS: '7',
  SENIORS: '8',
  DUAL: '9',
  TIME_TRIALS: '0',
  INTERNATIONAL: 'A',
  OPEN: 'B',
  LEAGUE: 'C',
} as const;
export type MeetTypeCode = (typeof MeetTypeCode)[keyof typeof MeetTypeCode];

/** Swimmer Sex codes (SEX Code 010). */
export const SexCode = {
  MALE: 'M',
  FEMALE: 'F',
} as const;
export type SexCode = (typeof SexCode)[keyof typeof SexCode];

/** Event Sex codes (EVENT SEX Code 011). */
export const EventSexCode = {
  MALE: 'M',
  FEMALE: 'F',
  MIXED: 'X',
} as const;
export type EventSexCode = (typeof EventSexCode)[keyof typeof EventSexCode];

/** Event Stroke codes (STROKE Code 012). */
export const StrokeCode = {
  FREESTYLE: '1',
  BACKSTROKE: '2',
  BREASTSTROKE: '3',
  BUTTERFLY: '4',
  INDIVIDUAL_MEDLEY: '5',
  FREE_RELAY: '6',
  MEDLEY_RELAY: '7',
} as const;
export type StrokeCode = (typeof StrokeCode)[keyof typeof StrokeCode];

/**
 * Course/Status codes (COURSE Code 013).
 *
 * Per the spec: '1' or 'S' = short course meters, '2' or 'Y' = short course
 * yards, '3' or 'L' = long course meters, 'X' = disqualified. The spec has no
 * 'M', but real-world files (Hy-Tek Meet Manager output among others) commonly
 * use 'M' for short course meters. All variants are accepted; use
 * {@link normalizeCourseCode} to collapse them to the canonical M/Y/L letters.
 */
export const CourseStatusCode = {
  /** Short course meters — the common real-world alpha code (not in the spec). */
  SHORT_METERS: 'M',
  /** Short course meters — the spec's alpha code. */
  SHORT_METERS_SPEC: 'S',
  /** Short course yards — spec alpha code. */
  SHORT_YARDS: 'Y',
  /** Long course meters — spec alpha code. */
  LONG_METERS: 'L',
  /** Disqualified. */
  DISQUALIFIED: 'X',
  /** Short course meters — spec integer alternate. */
  SHORT_METERS_INT: '1',
  /** Short course yards — spec integer alternate. */
  SHORT_YARDS_INT: '2',
  /** Long course meters — spec integer alternate. */
  LONG_METERS_INT: '3',
} as const;
export type CourseStatusCode = (typeof CourseStatusCode)[keyof typeof CourseStatusCode];

/**
 * Normalize a course code to its canonical letter form  '1' and 'S' map to 'M',
 * '2' to 'Y', '3' to 'L'; any other value is returned unchanged.
 */
export function normalizeCourseCode(code: string): string {
  switch (code) {
    case CourseStatusCode.SHORT_METERS_INT:
    case CourseStatusCode.SHORT_METERS_SPEC:
      return CourseStatusCode.SHORT_METERS;
    case CourseStatusCode.SHORT_YARDS_INT:
      return CourseStatusCode.SHORT_YARDS;
    case CourseStatusCode.LONG_METERS_INT:
      return CourseStatusCode.LONG_METERS;
    default:
      return code;
  }
}

/**
 * Event Time Class codes (EVENT TIME CLASS Code 014).
 *
 * Two characters are concatenated to form the 2-byte event time class:
 * the first indicates the lower limit, the second the upper limit.
 * '22' indicates B meets, '23' B-A meets, and '40' AA+ meets — the
 * no-upper-limit character is the digit zero ('0'). The spec's code table
 * prints it as the letter O, but real files use the digit.
 */
export const EventTimeClassCode = {
  NO_LOWER_LIMIT: 'U',
  NO_UPPER_LIMIT: '0',
  NOVICE: '1',
  B_STANDARD: '2',
  BB_STANDARD: 'P',
  A_STANDARD: '3',
  AA_STANDARD: '4',
  AAA_STANDARD: '5',
  AAAA_STANDARD: '6',
  JUNIOR_STANDARD: 'J',
  SENIOR_STANDARD: 'S',
} as const;
export type EventTimeClassCode = (typeof EventTimeClassCode)[keyof typeof EventTimeClassCode];

/** Attached codes (ATTACH Code 016). */
export const AttachCode = {
  ATTACHED: 'A',
  UNATTACHED: 'U',
} as const;
export type AttachCode = (typeof AttachCode)[keyof typeof AttachCode];

/** Prelims/Finals codes (PRELIMS/FINALS Code 019). */
export const PrelimsFinalsCode = {
  PRELIMS: 'P',
  FINALS: 'F',
  SWIM_OFFS: 'S',
} as const;
export type PrelimsFinalsCode = (typeof PrelimsFinalsCode)[keyof typeof PrelimsFinalsCode];

/** Membership transaction type codes (MEMBER Code 021). */
export const MemberCode = {
  RENEW: 'R',
  NEW: 'N',
  CHANGE: 'C',
  DELETE: 'D',
} as const;
export type MemberCode = (typeof MemberCode)[keyof typeof MemberCode];

/** Season codes (SEASON Code 022). */
export const SeasonCode = {
  SEASON_1: '1',
  SEASON_2: '2',
  YEAR_ROUND: 'N',
} as const;
export type SeasonCode = (typeof SeasonCode)[keyof typeof SeasonCode];

/** Relay leg order codes (ORDER Code 024). */
export const OrderCode = {
  NOT_ON_TEAM: '0',
  FIRST_LEG: '1',
  SECOND_LEG: '2',
  THIRD_LEG: '3',
  FOURTH_LEG: '4',
  ALTERNATE: 'A',
} as const;
export type OrderCode = (typeof OrderCode)[keyof typeof OrderCode];

/**
 * Ethnicity codes (ETHNICITY Code 026).
 *
 * The first byte contains the first ethnicity selection; the second byte an
 * optional second selection. If the first byte is V or W the second must be
 * blank.
 */
export const EthnicityCode = {
  AFRICAN_AMERICAN: 'Q',
  ASIAN_PACIFIC_ISLANDER: 'R',
  CAUCASIAN: 'S',
  HISPANIC: 'T',
  NATIVE_AMERICAN: 'U',
  OTHER: 'V',
  DECLINE: 'W',
} as const;
export type EthnicityCode = (typeof EthnicityCode)[keyof typeof EthnicityCode];

/** Split codes (SPLIT Code 015). */
export const SplitCode = {
  CUMULATIVE: 'C',
  INTERVAL: 'I',
} as const;
export type SplitCode = (typeof SplitCode)[keyof typeof SplitCode];

/** Country codes (COUNTRY Code 004). */
export const CountryCode = {
  AFG: 'AFG', // Afghanistan
  AHO: 'AHO', // Antilles Netherlands (Dutch West Indies)
  ALB: 'ALB', // Albania
  ALG: 'ALG', // Algeria
  AND: 'AND', // Andorra
  ANG: 'ANG', // Angola
  ANT: 'ANT', // Antigua
  ARG: 'ARG', // Argentina
  ARM: 'ARM', // Armenia
  ARU: 'ARU', // Aruba
  ASA: 'ASA', // American Samoa
  AUS: 'AUS', // Australia
  AUT: 'AUT', // Austria
  AZE: 'AZE', // Azerbaijan
  BAH: 'BAH', // Bahamas
  BAN: 'BAN', // Bangladesh
  BAR: 'BAR', // Barbados
  BEL: 'BEL', // Belgium
  BEN: 'BEN', // Benin
  BER: 'BER', // Bermuda
  BHU: 'BHU', // Bhutan
  BIZ: 'BIZ', // Belize
  BLS: 'BLS', // Belarus
  BOL: 'BOL', // Bolivia
  BOT: 'BOT', // Botswana
  BRA: 'BRA', // Brazil
  BRN: 'BRN', // Bahrain
  BRU: 'BRU', // Brunei
  BUL: 'BUL', // Bulgaria
  BUR: 'BUR', // Burkina Faso
  CAF: 'CAF', // Central African Republic
  CAN: 'CAN', // Canada
  CAY: 'CAY', // Cayman Islands
  CGO: 'CGO', // People's Rep. of Congo
  CHA: 'CHA', // Chad
  CHI: 'CHI', // Chile
  CHN: 'CHN', // People's Rep. of China
  CIV: 'CIV', // Ivory Coast
  CMR: 'CMR', // Cameroon
  COK: 'COK', // Cook Islands
  COL: 'COL', // Colombia
  CRC: 'CRC', // Costa Rica
  CRO: 'CRO', // Croatia
  CUB: 'CUB', // Cuba
  CYP: 'CYP', // Cyprus
  DEN: 'DEN', // Denmark
  DJI: 'DJI', // Djibouti
  DOM: 'DOM', // Dominican Republic
  ECU: 'ECU', // Ecuador
  EGY: 'EGY', // Arab Republic of Egypt
  ESA: 'ESA', // El Salvador
  ESP: 'ESP', // Spain
  EST: 'EST', // Estonia
  ETH: 'ETH', // Ethiopia
  FIJ: 'FIJ', // Fiji
  FIN: 'FIN', // Finland
  FRA: 'FRA', // France
  GAB: 'GAB', // Gabon
  GAM: 'GAM', // Gambia
  GBR: 'GBR', // Great Britain
  GER: 'GER', // Germany
  GEO: 'GEO', // Georgia
  GEQ: 'GEQ', // Equatorial Guinea
  GHA: 'GHA', // Ghana
  GRE: 'GRE', // Greece
  GRN: 'GRN', // Grenada
  GUA: 'GUA', // Guatemala
  GUI: 'GUI', // Guinea
  GUM: 'GUM', // Guam
  GUY: 'GUY', // Guyana
  HAI: 'HAI', // Haiti
  HKG: 'HKG', // Hong Kong
  HON: 'HON', // Honduras
  HUN: 'HUN', // Hungary
  INA: 'INA', // Indonesia
  IND: 'IND', // India
  IRL: 'IRL', // Ireland
  IRI: 'IRI', // Islamic Rep. of Iran
  IRQ: 'IRQ', // Iraq
  ISL: 'ISL', // Iceland
  ISR: 'ISR', // Israel
  ISV: 'ISV', // Virgin Islands
  ITA: 'ITA', // Italy
  IVB: 'IVB', // British Virgin Islands
  JAM: 'JAM', // Jamaica
  JOR: 'JOR', // Jordan
  JPN: 'JPN', // Japan
  KEN: 'KEN', // Kenya
  KGZ: 'KGZ', // Kyrghyzstan
  KOR: 'KOR', // Korea (South)
  KSA: 'KSA', // Saudi Arabia
  KUW: 'KUW', // Kuwait
  KZK: 'KZK', // Kazakhstan
  LAO: 'LAO', // Laos
  LAT: 'LAT', // Latvia
  LBA: 'LBA', // Libya
  LBR: 'LBR', // Liberia
  LES: 'LES', // Lesotho
  LIB: 'LIB', // Lebanon
  LIE: 'LIE', // Liechtenstein
  LIT: 'LIT', // Lithuania
  LUX: 'LUX', // Luxembourg
  MAD: 'MAD', // Madagascar
  MAS: 'MAS', // Malaysia
  MAR: 'MAR', // Morocco
  MAW: 'MAW', // Malawi
  MDV: 'MDV', // Maldives
  MEX: 'MEX', // Mexico
  MGL: 'MGL', // Mongolia
  MLD: 'MLD', // Moldova
  MLI: 'MLI', // Mali
  MLT: 'MLT', // Malta
  MON: 'MON', // Monaco
  MOZ: 'MOZ', // Mozambique
  MRI: 'MRI', // Mauritius
  MTN: 'MTN', // Mauritania
  MYA: 'MYA', // Union of Myanmar
  NAM: 'NAM', // Namibia
  NCA: 'NCA', // Nicaragua
  NED: 'NED', // The Netherlands
  NEP: 'NEP', // Nepal
  NIG: 'NIG', // Niger
  NGR: 'NGR', // Nigeria
  NOR: 'NOR', // Norway
  NZL: 'NZL', // New Zealand
  OMA: 'OMA', // Oman
  PAK: 'PAK', // Pakistan
  PAN: 'PAN', // Panama
  PAR: 'PAR', // Paraguay
  PER: 'PER', // Peru
  PHI: 'PHI', // Philippines
  PNG: 'PNG', // Papua-New Guinea
  POL: 'POL', // Poland
  POR: 'POR', // Portugal
  PRK: 'PRK', // Democratic People's Rep. of Korea
  PUR: 'PUR', // Puerto Rico
  QAT: 'QAT', // Qatar
  ROM: 'ROM', // Romania
  RSA: 'RSA', // South Africa
  RUS: 'RUS', // Russia
  RWA: 'RWA', // Rwanda
  SAM: 'SAM', // Western Samoa
  SEN: 'SEN', // Senegal
  SEY: 'SEY', // Seychelles
  SIN: 'SIN', // Singapore
  SLE: 'SLE', // Sierra Leone
  SLO: 'SLO', // Slovenia
  SMR: 'SMR', // San Marino
  SOL: 'SOL', // Solomon Islands
  SOM: 'SOM', // Somalia
  SRI: 'SRI', // Sri Lanka
  SUD: 'SUD', // Sudan
  SUI: 'SUI', // Switzerland
  SUR: 'SUR', // Surinam
  SWE: 'SWE', // Sweden
  SWZ: 'SWZ', // Swaziland
  SYR: 'SYR', // Syria
  TAN: 'TAN', // Tanzania
  TCH: 'TCH', // Czechoslovakia
  TGA: 'TGA', // Tonga
  THA: 'THA', // Thailand
  TJK: 'TJK', // Tadjikistan
  TOG: 'TOG', // Togo
  TPE: 'TPE', // Chinese Taipei
  TRI: 'TRI', // Trinidad & Tobago
  TUN: 'TUN', // Tunisia
  TUR: 'TUR', // Turkey
  UAE: 'UAE', // United Arab Emirates
  UGA: 'UGA', // Uganda
  UKR: 'UKR', // Ukraine
  URU: 'URU', // Uruguay
  USA: 'USA', // United States of America
  VAN: 'VAN', // Vanuatu
  VEN: 'VEN', // Venezuela
  VIE: 'VIE', // Vietnam
  VIN: 'VIN', // St. Vincent and the Grenadines
  YEM: 'YEM', // Yemen
  YUG: 'YUG', // Yugoslavia
  ZAI: 'ZAI', // Zaire
  ZAM: 'ZAM', // Zambia
  ZIM: 'ZIM', // Zimbabwe
} as const;
export type CountryCode = (typeof CountryCode)[keyof typeof CountryCode];

/** Citizenship codes (CITIZEN Code 009) — extends CountryCode. */
export const CitizenshipCode = {
  ...CountryCode,
  /** Dual: USA and other country */
  DUAL: '2AL',
  /** Foreign citizenship */
  FOREIGN: 'FGN',
} as const;
export type CitizenshipCode = (typeof CitizenshipCode)[keyof typeof CitizenshipCode];
