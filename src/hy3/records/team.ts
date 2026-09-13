/**
 * C1 identifies a team: code [2:6], full name [7:36], short name [37:52],
 * regional code [53:54], head and assistant coaches [55:114], and team type
 * [119:121].
 *
 * The coach fields are present in observed Team Manager exports even though
 * some older community implementations treated that area as reserved.
 */
import { FieldRequirement, FieldType, type FieldDefinition } from '../fields';
import { TeamTypeCode } from '../codes';
import { CHECKSUM_FIELD, HytekRecord, stringifyFieldValue } from './base';

export class TeamRecord extends HytekRecord {
  readonly identifier = 'C1';

  protected readonly fields: FieldDefinition[] = [
    {
      name: 'teamCode',
      start: 3,
      length: 5,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.MANDATORY,
    },
    {
      name: 'name',
      start: 8,
      length: 30,
      type: FieldType.NAME,
      requirement: FieldRequirement.MANDATORY,
    },
    {
      name: 'abbreviation',
      start: 38,
      length: 16,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'lsc',
      start: 54,
      length: 2,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      // 0-based [55:84] — see the coach-column note above.
      name: 'headCoachName',
      start: 56,
      length: 30,
      type: FieldType.NAME,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      // 0-based [85:114] — see the coach-column note above.
      name: 'assistantCoachName',
      start: 86,
      length: 30,
      type: FieldType.NAME,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      // Observed exports place the left-justified team type in 0-based
      // [119:121].
      name: 'teamType',
      start: 120,
      length: 3,
      type: FieldType.CODE,
      requirement: FieldRequirement.OPTIONAL,
      codeType: TeamTypeCode,
    },
    CHECKSUM_FIELD,
  ];

  teamCode!: string;
  name!: string;
  abbreviation?: string;
  lsc?: string;
  headCoachName?: string;
  assistantCoachName?: string;
  teamType?: TeamTypeCode;
  checksum?: string;

  constructor(data?: Partial<TeamRecord>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  protected formatFieldValue(value: unknown, field: FieldDefinition): string {
    // Team codes are conventionally uppercase.
    if (field.name === 'teamCode' && value) {
      return stringifyFieldValue(value).toUpperCase().slice(0, field.length).padEnd(field.length);
    }

    return super.formatFieldValue(value, field);
  }

  protected parseFieldValue(value: string, field: FieldDefinition): unknown {
    if (field.name === 'teamCode') {
      return value.trim().toUpperCase();
    }

    return super.parseFieldValue(value, field);
  }
}
