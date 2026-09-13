/**
 * D1 identifies one swimmer. Offsets were reconstructed from Team Manager 8
 * roster, entry, and result exports and cross-checked against public HY3
 * implementations.
 *
 * The primary identity region contains sex [2], the right-aligned swimmer key
 * [3:7], three 20-character name fields [8:67], middle initial [68],
 * registration number [69:82], an optional database key [83:87], birth date
 * [88:95], age [97:98], and grade [99:100]. The later group fields occur at
 * [105:110], registration region at [112:114], and two additional group slots
 * at [116:121]. An asterisk at [101] marks an inactive swimmer in observed
 * roster exports.
 *
 * The two-character age and grade widths, plus the later group offsets, follow
 * actual exports where older community descriptions disagree.
 */

import { FieldRequirement, FieldType, type FieldDefinition } from '../fields';
import { SexCode } from '../codes';
import { CHECKSUM_FIELD, HytekRecord } from './base';

export class IndividualInfoRecord extends HytekRecord {
  readonly identifier = 'D1';

  protected readonly fields: FieldDefinition[] = [
    {
      name: 'swimmerGender',
      start: 3,
      length: 1,
      type: FieldType.CODE,
      requirement: FieldRequirement.MANDATORY,
      codeType: SexCode,
    },
    {
      name: 'swimmerId',
      start: 4,
      length: 5,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
      justify: 'right',
    },
    {
      name: 'swimmerLastName',
      start: 9,
      length: 20,
      type: FieldType.NAME,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'swimmerFirstName',
      start: 29,
      length: 20,
      type: FieldType.NAME,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'swimmerNickName',
      start: 49,
      length: 20,
      type: FieldType.NAME,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'swimmerMiddleInitial',
      start: 69,
      length: 1,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'ussNumber',
      start: 70,
      length: 14,
      type: FieldType.USS_NUM,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'teamSwimmerId',
      start: 84,
      length: 5,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
      justify: 'right',
    },
    {
      name: 'swimmerBirthDate',
      start: 89,
      length: 8,
      type: FieldType.DATE,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'swimmerAge',
      start: 98,
      length: 2,
      type: FieldType.INTEGER,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'schoolYear',
      start: 100,
      length: 2,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      // '*' when the athlete is inactive — see the layout note above.
      name: 'inactive',
      start: 102,
      length: 1,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'group',
      start: 106,
      length: 3,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'subgroup',
      start: 109,
      length: 3,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'registrationCountry',
      start: 113,
      length: 3,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'wmGroup',
      start: 117,
      length: 3,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'wmSubgroup',
      start: 120,
      length: 3,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    CHECKSUM_FIELD,
  ];

  swimmerGender!: SexCode;
  swimmerId?: string;
  swimmerLastName?: string;
  swimmerFirstName?: string;
  swimmerNickName?: string;
  swimmerMiddleInitial?: string;
  ussNumber?: string;
  teamSwimmerId?: string;
  swimmerBirthDate?: Date;
  swimmerAge?: number;
  schoolYear?: string;
  inactive?: string;
  group?: string;
  subgroup?: string;
  registrationCountry?: string;
  wmGroup?: string;
  wmSubgroup?: string;
  checksum?: string;

  constructor(data?: Partial<IndividualInfoRecord>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }
}
