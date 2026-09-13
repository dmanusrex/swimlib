/**
 * E2 follows an E1 entry and stores one individual result. The leading fields
 * are round [2], time [3:10], course [11], status [12], DQ reason [13:14],
 * heat [20:22], lane [23:25], heat placing [26:28], and overall placing
 * [29:32]. Timing-system values occupy [36:59] and [65:81], points are at
 * [60:62], reaction time at [83:86], and event date at [102:109].
 *
 * Published community descriptions differ by one character for several
 * right-aligned numeric values. The contiguous ranges used here were verified
 * against Team Manager result exports. In those exports points are stored in
 * tenths, and the three-character status area separates a one-character result
 * state from a two-character DQ reason.
 */
import { SwimTime } from '../../core/swimtime';
import { FieldRequirement, FieldType, type FieldDefinition } from '../fields';
import { CourseStatusCode, ResultStatusCode, RoundCode } from '../codes';
import { CHECKSUM_FIELD, HytekRecord } from './base';

export class IndividualResultRecord extends HytekRecord {
  readonly identifier = 'E2';

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
      // stored in tenths (for example, '40' represents 4.0 points).
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
      name: 'touchpadTime1',
      start: 66,
      length: 8,
      type: FieldType.TIME,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'touchpadTime2',
      start: 75,
      length: 8,
      type: FieldType.TIME,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'reactionTime',
      start: 84,
      length: 4,
      type: FieldType.DECIMAL,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'dayOfEvent',
      start: 103,
      length: 8,
      type: FieldType.DATE,
      requirement: FieldRequirement.OPTIONAL,
    },
    CHECKSUM_FIELD,
  ];

  round!: RoundCode;
  time?: SwimTime;
  course?: CourseStatusCode;
  resultStatusCode?: ResultStatusCode;
  dqReasonCode?: string;
  heat?: number;
  lane?: number;
  heatPlace?: number;
  overallPlace?: number;
  points?: number;
  backupTime1?: SwimTime;
  backupTime2?: SwimTime;
  backupTime3?: SwimTime;
  touchpadTime1?: SwimTime;
  touchpadTime2?: SwimTime;
  reactionTime?: number;
  dayOfEvent?: Date;
  checksum?: string;

  constructor(data?: Partial<IndividualResultRecord>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }
}
