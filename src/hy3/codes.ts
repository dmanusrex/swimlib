/**
 * HY3 code tables. The HY3 format shares ancestry with SDIF and reuses many
 * of the same tables (with a few Hy-Tek-specific values and letter schemes),
 * but the module is self-contained: tables are local copies rather than
 * imports from src/sdif. All tables are as-const objects; the derived union
 * types accept the raw string codes as parsed from files.
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

/**
 * HY3 A1 file-type codes.
 *
 */
export const FileCode = {
  MERGE_MEET_ENTRIES: '01',
  MEET_ENTRIES: '02',
  TEAM_ROSTER: '03',
  MERGE_MEET_RESULTS: '04',
  MEET_MANAGER_RESULTS: '07',
  MERGE_ADVANCER_ENTRIES: '08',
  TEAM_MANAGER_RESULTS: '09',
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

/**
 * Swimmer Sex codes (SEX Code 010). Hy-Tek files additionally use W for
 * female and B/G for boys/girls in age-group event designations.
 */
export const SexCode = {
  MALE: 'M',
  FEMALE: 'F',
  FEMALE_ALT: 'W',
  BOYS: 'B',
  GIRLS: 'G',
} as const;
export type SexCode = (typeof SexCode)[keyof typeof SexCode];

/** Event Sex codes (EVENT SEX Code 011). */
export const EventSexCode = {
  MALE: 'M',
  FEMALE: 'F',
  MIXED: 'X',
} as const;
export type EventSexCode = (typeof EventSexCode)[keyof typeof EventSexCode];

/**
 * Event Stroke codes. HY3 uses letters (unlike SDIF's digit codes):
 * A=Free, B=Back, C=Breast, D=Fly, E=Medley, and F/G/H for 1m/3m/10m
 * diving events.
 */
export const StrokeCode = {
  FREESTYLE: 'A',
  BACKSTROKE: 'B',
  BREASTSTROKE: 'C',
  BUTTERFLY: 'D',
  INDIVIDUAL_MEDLEY: 'E',
  DIVING_1M: 'F',
  DIVING_3M: 'G',
  DIVING_10M: 'H',
} as const;
export type StrokeCode = (typeof StrokeCode)[keyof typeof StrokeCode];

/** Result type codes used by split (G1) records. */
export const ResultTypeCode = {
  FINAL: 'F',
  PRELIMINARY: 'P',
} as const;
export type ResultTypeCode = (typeof ResultTypeCode)[keyof typeof ResultTypeCode];

/**
 * Round codes used by result (E2/F2) records. Early layout notes identify
 * finals and preliminaries; observed community readers also recognize
 * semifinals and time trials.
 */
export const RoundCode = {
  PRELIMS: 'P',
  FINALS: 'F',
  SEMIFINALS: 'S',
  TIME_TRIALS: 'T',
} as const;
export type RoundCode = (typeof RoundCode)[keyof typeof RoundCode];

/**
 * Result status codes carried at 0-based [12] of E2/F2 result records.
 * Blank means a normal swim (the field is absent). On a DQ the status is
 * followed by a 2-character DQ reason code at [13:15) whose description is
 * carried by the H1 record that follows the result.
 */
export const ResultStatusCode = {
  DISQUALIFIED: 'Q',
  /** No Start / No Show. */
  NO_SHOW: 'R',
  /** Scratch (swimmer not swimming in finals). */
  SCRATCH: 'S',
  FALSE_START: 'F',
} as const;
export type ResultStatusCode = (typeof ResultStatusCode)[keyof typeof ResultStatusCode];

/**
 * Course/Status codes (COURSE Code 013).
 *
 * Real-world files use both the letter codes (M/Y/L) and the integer
 * alternates (1/2/3); Hy-Tek additionally emits a non-standard 'S' for
 * short course meters. All variants are accepted.
 */
export const CourseStatusCode = {
  SHORT_METERS: 'M',
  SHORT_YARDS: 'Y',
  LONG_METERS: 'L',
  DISQUALIFIED: 'X',
  SHORT_METERS_INT: '1',
  SHORT_YARDS_INT: '2',
  LONG_METERS_INT: '3',
  SHORT_METERS_HYTEK: 'S',
} as const;
export type CourseStatusCode = (typeof CourseStatusCode)[keyof typeof CourseStatusCode];

/**
 * Event Time Class codes (EVENT TIME CLASS Code 014).
 *
 * Two characters are concatenated to form the 2-byte event time class:
 * the first indicates the lower limit, the second the upper limit.
 * '22' indicates B meets, '23' B-A meets, '4O' AA+ meets.
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

/** Team Type codes (C1 record, from Hy-Tek Team Manager). */
export const TeamTypeCode = {
  /** Age Group */
  AGE: 'AGE',
  /** High School */
  HS: 'HS',
  /** College */
  COL: 'COL',
  /** Masters */
  MAS: 'MAS',
  /** Other */
  OTH: 'OTH',
  /** Recreation */
  REC: 'REC',
} as const;
export type TeamTypeCode = (typeof TeamTypeCode)[keyof typeof TeamTypeCode];

/** Team Registration codes (C2 record, from Hy-Tek Team Manager). */
export const TeamRegistrationCode = {
  /** Australia */
  AUST: 'AUST',
  /** Canada (BCSSA) */
  BCSS: 'BCSS',
  /** New Zealand */
  NZSF: 'NZSF',
  /** Other */
  OTH: 'OTH',
  /** South Africa */
  SSA: 'SSA',
  /** United Kingdom */
  UK: 'UK',
  /** USA Swimming */
  USS: 'USS',
} as const;
export type TeamRegistrationCode = (typeof TeamRegistrationCode)[keyof typeof TeamRegistrationCode];

/** Attached codes (ATTACH Code 016). */
export const AttachCode = {
  ATTACHED: 'A',
  UNATTACHED: 'U',
} as const;
export type AttachCode = (typeof AttachCode)[keyof typeof AttachCode];

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
