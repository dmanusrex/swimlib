/**
 * Individual Administrative (D1) Record Model
 *
 * Identifies the athlete by name, registration number, birth date and gender,
 * along with administrative information. When used, one D1 record is
 * submitted for each swimmer in the file. This record type is
 * registration-oriented: several fields are marked in the spec as "required
 * for submission of registration data to LSC" — those are modeled as OPTIONAL
 * here since they are only conditionally required.
 */

import { FieldRequirement, FieldType, type FieldDefinition } from '../fields';
import { AttachCode, MemberCode, OrganizationCode, SexCode } from '../codes';
import { SdifRecord, stringifyFieldValue } from './base';

export class IndividualAdminRecord extends SdifRecord {
  readonly identifier = 'D1';

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
      name: 'teamCode',
      start: 12,
      length: 6,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'teamCode5',
      start: 18,
      length: 1,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'name',
      start: 19,
      length: 28,
      type: FieldType.NAME,
      requirement: FieldRequirement.MANDATORY_M1,
    },
    {
      name: 'ussn',
      start: 48,
      length: 12,
      type: FieldType.USS_NUM,
      requirement: FieldRequirement.MANDATORY_M2,
    },
    {
      name: 'attached',
      start: 60,
      length: 1,
      type: FieldType.CODE,
      requirement: FieldRequirement.OPTIONAL,
      codeType: AttachCode,
    },
    {
      name: 'citizen',
      start: 61,
      length: 3,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'birthdate',
      start: 64,
      length: 8,
      type: FieldType.DATE,
      requirement: FieldRequirement.MANDATORY_M2,
    },
    {
      name: 'ageOrClass',
      start: 72,
      length: 2,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'sex',
      start: 74,
      length: 1,
      type: FieldType.CODE,
      requirement: FieldRequirement.MANDATORY_M1,
      codeType: SexCode,
    },
    {
      name: 'adminInfo1',
      start: 75,
      length: 30,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'adminInfo4',
      start: 105,
      length: 20,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'phone1',
      start: 125,
      length: 12,
      type: FieldType.PHONE,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'phone2',
      start: 137,
      length: 12,
      type: FieldType.PHONE,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'ussRegistrationDate',
      start: 149,
      length: 8,
      type: FieldType.DATE,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'memberCode',
      start: 157,
      length: 1,
      type: FieldType.CODE,
      requirement: FieldRequirement.OPTIONAL,
      codeType: MemberCode,
    },
  ];

  organization?: OrganizationCode;
  /** USS team code (TEAM Code 006); required for LSC registration submissions. */
  teamCode?: string;
  /** Optional 5th character of the team code. */
  teamCode5?: string;
  name!: string;
  ussn?: string;
  attached?: AttachCode;
  /** Citizenship (CITIZEN Code 009); required for LSC registration submissions. */
  citizen?: string;
  birthdate?: Date;
  /** Swimmer age or class (such as Jr or Sr). */
  ageOrClass?: string;
  sex!: SexCode;
  /** First admin info field (converted to future use by a v3 revision). */
  adminInfo1?: string;
  /**
   * Fourth admin info field — used in submission of registration data for
   * the old member number if initials or birthdate change.
   */
  adminInfo4?: string;
  /** First phone number; required for LSC registration submissions. */
  phone1?: string;
  phone2?: string;
  /** Date swimmer registered with USS; required for LSC registration submissions. */
  ussRegistrationDate?: Date;
  /** Membership transaction type (MEMBER Code 021). */
  memberCode?: MemberCode;

  constructor(data?: Partial<IndividualAdminRecord>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  protected formatFieldValue(value: unknown, field: FieldDefinition): string {
    // Team codes are conventionally uppercase
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
