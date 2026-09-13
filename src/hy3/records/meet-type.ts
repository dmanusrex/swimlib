/**
 * HY3 meet-type record (B2).
 *
 * Uses columns 2-93 as reserved space, columns 94-95 for the masters flag,
 * 96-97 for the meet type, 98 for the first course code, 99-105 for the entry
 * fee, and 106 for the second course code. Observed exports establish column
 * 106 as the second-course position.
 */
import { FieldRequirement, FieldType, type FieldDefinition } from '../fields';
import { CourseStatusCode } from '../codes';
import { CHECKSUM_FIELD, HytekRecord } from './base';

export class MeetTypeRecord extends HytekRecord {
  readonly identifier = 'B2';

  protected readonly fields: FieldDefinition[] = [
    {
      name: 'masters',
      start: 95,
      length: 2,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'meetType',
      start: 97,
      length: 2,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'courseCode1',
      start: 99,
      length: 1,
      type: FieldType.CODE,
      requirement: FieldRequirement.OPTIONAL,
      codeType: CourseStatusCode,
    },
    {
      name: 'meetFee',
      start: 100,
      length: 7,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
      justify: 'right',
    },
    {
      name: 'courseCode2',
      start: 107,
      length: 1,
      type: FieldType.CODE,
      requirement: FieldRequirement.OPTIONAL,
      codeType: CourseStatusCode,
    },
    CHECKSUM_FIELD,
  ];

  /** '06' marks a Masters meet; blank otherwise. */
  masters?: string;
  /** Meet type designation, such as age-group, senior, or open. */
  meetType?: string;
  courseCode1?: CourseStatusCode;
  /** Right-justified decimal string, e.g. '0.00' (observed in TM8 output). */
  meetFee?: string;
  courseCode2?: CourseStatusCode;
  checksum?: string;

  constructor(data?: Partial<MeetTypeRecord>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }
}
