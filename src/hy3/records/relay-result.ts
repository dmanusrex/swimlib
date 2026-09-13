/**
 * F2 follows an F1 entry and stores one relay result. Its leading result fields
 * use the same positions as E2. It additionally carries a third backup time,
 * a touchpad value, and four consecutive reaction-time fields at [83:101].
 *
 * The layout and tenths-of-a-point representation were verified against Team
 * Manager result exports, including disqualified and exhibition swims.
 */
import { SwimTime } from '../../core/swimtime';
import { FieldRequirement, FieldType, type FieldDefinition } from '../fields';
import { CourseStatusCode, ResultStatusCode, RoundCode } from '../codes';
import { CHECKSUM_FIELD, HytekRecord } from './base';

export class RelayResultRecord extends HytekRecord {
  readonly identifier = 'F2';

  protected readonly fields: FieldDefinition[] = [
    {
      name: 'round',
      start: 3,
      length: 1,
      type: FieldType.CODE,
      requirement: FieldRequirement.MANDATORY,
      codeType: RoundCode,
    },
    {
      name: 'time',
      start: 4,
      length: 8,
      type: FieldType.TIME,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'course',
      start: 12,
      length: 1,
      type: FieldType.CODE,
      requirement: FieldRequirement.OPTIONAL,
      codeType: CourseStatusCode,
    },
    {
      name: 'resultStatusCode',
      start: 13,
      length: 1,
      type: FieldType.CODE,
      requirement: FieldRequirement.OPTIONAL,
      codeType: ResultStatusCode,
    },
    {
      name: 'dqReasonCode',
      start: 14,
      length: 2,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      // 0-based [15]: 'X' observed in a TM8 results export on a relay with
      // a valid time but zero place/points — exhibition-swim marker.
      name: 'exhibitionFlag',
      start: 16,
      length: 1,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'heat',
      start: 21,
      length: 3,
      type: FieldType.INTEGER,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'lane',
      start: 24,
      length: 3,
      type: FieldType.INTEGER,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'heatPlace',
      start: 27,
      length: 3,
      type: FieldType.INTEGER,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'overallPlace',
      start: 30,
      length: 4,
      type: FieldType.INTEGER,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      // Observed exports place points in 0-based [60:62], right-justified and
      // stored in tenths (for example, '180' represents 18.0 points).
      name: 'points',
      start: 61,
      length: 3,
      type: FieldType.INTEGER,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'backupTime1',
      start: 37,
      length: 8,
      type: FieldType.TIME,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'backupTime2',
      start: 45,
      length: 8,
      type: FieldType.TIME,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'backupTime3',
      start: 53,
      length: 8,
      type: FieldType.TIME,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'touchpadTime',
      start: 66,
      length: 8,
      type: FieldType.TIME,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'reactionTime1',
      start: 84,
      length: 4,
      type: FieldType.DECIMAL,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'reactionTime2',
      start: 88,
      length: 5,
      type: FieldType.DECIMAL,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'reactionTime3',
      start: 93,
      length: 5,
      type: FieldType.DECIMAL,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'reactionTime4',
      start: 98,
      length: 5,
      type: FieldType.DECIMAL,
      requirement: FieldRequirement.OPTIONAL,
    },
    CHECKSUM_FIELD,
  ];

  round!: RoundCode;
  time?: SwimTime;
  course?: CourseStatusCode;
  resultStatusCode?: ResultStatusCode;
  dqReasonCode?: string;
  /** 'X' marks an exhibition swim (zero place/points despite a time). */
  exhibitionFlag?: string;
  heat?: number;
  lane?: number;
  heatPlace?: number;
  overallPlace?: number;
  points?: number;
  backupTime1?: SwimTime;
  backupTime2?: SwimTime;
  backupTime3?: SwimTime;
  touchpadTime?: SwimTime;
  reactionTime1?: number;
  reactionTime2?: number;
  reactionTime3?: number;
  reactionTime4?: number;
  checksum?: string;

  constructor(data?: Partial<RelayResultRecord>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }
}
