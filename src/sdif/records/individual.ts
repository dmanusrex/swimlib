/**
 * Individual Event (D0) Record Model
 *
 * Identifies the athlete and the individual event. One record is submitted
 * for each swimmer entered in an individual event. The athlete name, USS
 * registration number, birth date and gender code are required, along with
 * the stroke, distance, event number, age range, and date of swim.
 */

import { SwimTime } from '../../core/swimtime';
import { FieldRequirement, FieldType, type FieldDefinition } from '../fields';
import {
  AttachCode,
  CourseStatusCode,
  EventSexCode,
  OrganizationCode,
  SexCode,
  StrokeCode,
} from '../codes';
import { SdifRecord, stringifyFieldValue } from './base';

export class IndividualEventRecord extends SdifRecord {
  readonly identifier = 'D0';

  protected readonly fields: FieldDefinition[] = [
    {
      name: 'organization',
      start: 3,
      length: 1,
      type: FieldType.CODE,
      requirement: FieldRequirement.MANDATORY_M2,
      codeType: OrganizationCode,
    },
    {
      name: 'name',
      start: 12,
      length: 28,
      type: FieldType.NAME,
      requirement: FieldRequirement.MANDATORY_M1,
    },
    {
      name: 'ussn',
      start: 40,
      length: 12,
      type: FieldType.USS_NUM,
      requirement: FieldRequirement.MANDATORY_M2,
    },
    {
      name: 'attached',
      start: 52,
      length: 1,
      type: FieldType.CODE,
      requirement: FieldRequirement.OPTIONAL,
      codeType: AttachCode,
    },
    {
      name: 'citizen',
      start: 53,
      length: 3,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'birthdate',
      start: 56,
      length: 8,
      type: FieldType.DATE,
      requirement: FieldRequirement.MANDATORY_M2,
    },
    {
      name: 'ageOrClass',
      start: 64,
      length: 2,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'sex',
      start: 66,
      length: 1,
      type: FieldType.CODE,
      requirement: FieldRequirement.MANDATORY_M1,
      codeType: SexCode,
    },
    {
      name: 'eventSex',
      start: 67,
      length: 1,
      type: FieldType.CODE,
      requirement: FieldRequirement.OPTIONAL,
      codeType: EventSexCode,
    },
    {
      name: 'eventDistance',
      start: 68,
      length: 4,
      type: FieldType.INTEGER,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'stroke',
      start: 72,
      length: 1,
      type: FieldType.CODE,
      requirement: FieldRequirement.OPTIONAL,
      codeType: StrokeCode,
    },
    {
      name: 'eventNumber',
      start: 73,
      length: 4,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'eventAge',
      start: 77,
      length: 4,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'dateOfSwim',
      start: 81,
      length: 8,
      type: FieldType.DATE,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'seedTime',
      start: 89,
      length: 8,
      type: FieldType.TIME,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'seedCourse',
      start: 97,
      length: 1,
      type: FieldType.CODE,
      requirement: FieldRequirement.OPTIONAL,
      codeType: CourseStatusCode,
    },
    {
      name: 'prelimTime',
      start: 98,
      length: 8,
      type: FieldType.TIME,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'prelimCourse',
      start: 106,
      length: 1,
      type: FieldType.CODE,
      requirement: FieldRequirement.OPTIONAL,
      codeType: CourseStatusCode,
    },
    {
      name: 'swimOffTime',
      start: 107,
      length: 8,
      type: FieldType.TIME,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'swimOffCourse',
      start: 115,
      length: 1,
      type: FieldType.CODE,
      requirement: FieldRequirement.OPTIONAL,
      codeType: CourseStatusCode,
    },
    {
      name: 'finalsTime',
      start: 116,
      length: 8,
      type: FieldType.TIME,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'finalsCourse',
      start: 124,
      length: 1,
      type: FieldType.CODE,
      requirement: FieldRequirement.OPTIONAL,
      codeType: CourseStatusCode,
    },
    {
      name: 'prelimHeatNumber',
      start: 125,
      length: 2,
      type: FieldType.INTEGER,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'prelimLaneNumber',
      start: 127,
      length: 2,
      type: FieldType.INTEGER,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'finalsHeatNumber',
      start: 129,
      length: 2,
      type: FieldType.INTEGER,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'finalsLaneNumber',
      start: 131,
      length: 2,
      type: FieldType.INTEGER,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'prelimPlaceRanking',
      start: 133,
      length: 3,
      type: FieldType.INTEGER,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'finalsPlaceRanking',
      start: 136,
      length: 3,
      type: FieldType.INTEGER,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'pointsScoredFinals',
      start: 139,
      length: 4,
      type: FieldType.DECIMAL,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'eventTimeClass',
      start: 143,
      length: 2,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'flightStatus',
      start: 145,
      length: 1,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'centipointsScoredFinals',
      start: 151,
      length: 2,
      type: FieldType.INTEGER,
      requirement: FieldRequirement.OPTIONAL,
    },
  ];

  organization?: OrganizationCode;
  name!: string;
  ussn?: string;
  attached?: AttachCode;
  citizen?: string;
  birthdate?: Date;
  ageOrClass?: string;
  sex!: SexCode;
  eventSex?: EventSexCode;
  eventDistance?: number;
  stroke?: StrokeCode;
  eventNumber?: string;
  eventAge?: string;
  dateOfSwim?: Date;
  seedTime?: SwimTime;
  seedCourse?: CourseStatusCode;
  prelimTime?: SwimTime;
  prelimCourse?: CourseStatusCode;
  swimOffTime?: SwimTime;
  swimOffCourse?: CourseStatusCode;
  finalsTime?: SwimTime;
  finalsCourse?: CourseStatusCode;
  prelimHeatNumber?: number;
  prelimLaneNumber?: number;
  finalsHeatNumber?: number;
  finalsLaneNumber?: number;
  prelimPlaceRanking?: number;
  finalsPlaceRanking?: number;
  pointsScoredFinals?: number;
  eventTimeClass?: string;
  flightStatus?: string;
  /**
   * Hundredths of points scored in finals — a Hy-Tek Meet Manager extension
   * living in the spec's "future use" space (151/2). When the finals points
   * are 4.5 due to a tie, {@link pointsScoredFinals} holds ' 4.' and this
   * field holds '50'.
   */
  centipointsScoredFinals?: number;

  constructor(data?: Partial<IndividualEventRecord>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  protected formatFieldValue(value: unknown, field: FieldDefinition): string {
    // Event number is right justified with spaces
    if (field.name === 'eventNumber') {
      if (!value) return ' '.repeat(field.length);
      const eventNum = stringifyFieldValue(value).toUpperCase().trim();
      return eventNum.slice(0, field.length).padStart(field.length, ' ');
    }

    // Seed time defaults to right-justified "NT" when absent. This is
    // Hy-Tek Meet Manager's de-facto behavior: the spec says codes are
    // left-justified, but MM writes the seed-time NT right-justified.
    if (field.name === 'seedTime' && !value) {
      return '      NT';
    }

    return super.formatFieldValue(value, field);
  }

  protected parseFieldValue(value: string, field: FieldDefinition): unknown {
    const trimmed = value.trim();
    if (!trimmed) return null;

    if (field.type === FieldType.TIME) {
      return SwimTime.fromString(trimmed);
    }

    return super.parseFieldValue(value, field);
  }
}
