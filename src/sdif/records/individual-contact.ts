/**
 * Individual Contact (D2) Record Model
 *
 * Identifies the athlete by name along with mailing and contact information.
 * When used, one D2 record is submitted for each swimmer in the file. The
 * athlete name is required. This record type is registration-oriented:
 * several fields are marked in the spec as "required for submission of
 * registration data to LSC" — those are modeled as OPTIONAL here since they
 * are only conditionally required.
 */

import { FieldRequirement, FieldType, type FieldDefinition } from '../fields';
import { OrganizationCode, SeasonCode } from '../codes';
import { SdifRecord, stringifyFieldValue } from './base';

export class IndividualContactRecord extends SdifRecord {
  readonly identifier = 'D2';

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
      name: 'alternateMailingName',
      start: 47,
      length: 30,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'mailingAddress',
      start: 77,
      length: 30,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'mailingCity',
      start: 107,
      length: 20,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'mailingState',
      start: 127,
      length: 2,
      type: FieldType.USPS,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'mailingCountry',
      start: 129,
      length: 12,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'postalCode',
      start: 141,
      length: 10,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'countryCode',
      start: 151,
      length: 3,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'region',
      start: 154,
      length: 1,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'answerCode',
      start: 155,
      length: 1,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'seasonCode',
      start: 156,
      length: 1,
      type: FieldType.CODE,
      requirement: FieldRequirement.OPTIONAL,
      codeType: SeasonCode,
    },
  ];

  organization?: OrganizationCode;
  /** USS team code (TEAM Code 006); required for LSC registration submissions. */
  teamCode?: string;
  /** Optional 5th character of the team code. */
  teamCode5?: string;
  name!: string;
  alternateMailingName?: string;
  /** Mailing street address; required for LSC registration submissions. */
  mailingAddress?: string;
  /** Mailing city; required for LSC registration submissions. */
  mailingCity?: string;
  /** Mailing state; required for LSC registration submissions. */
  mailingState?: string;
  /** Mailing country as free text (distinct from the 3-char country code). */
  mailingCountry?: string;
  /** Postal code, zip or foreign; required for LSC registration submissions. */
  postalCode?: string;
  /** Country code (COUNTRY Code 004). */
  countryCode?: string;
  /** USS region (REGION Code 007: 1-9, A-E). */
  region?: string;
  /**
   * "Is swimmer also a member of another FINA federation?" — ANSWER Code 023
   * was removed by a v3 revision (made future use) and its table was never
   * published, so this is modeled as free alpha.
   */
  answerCode?: string;
  /** Season the swimmer is registered for (SEASON Code 022). */
  seasonCode?: SeasonCode;

  constructor(data?: Partial<IndividualContactRecord>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  protected formatFieldValue(value: unknown, field: FieldDefinition): string {
    // Country and team codes are conventionally uppercase
    if ((field.name === 'countryCode' || field.name === 'teamCode') && value) {
      return stringifyFieldValue(value).toUpperCase().slice(0, field.length).padEnd(field.length);
    }

    return super.formatFieldValue(value, field);
  }

  protected parseFieldValue(value: string, field: FieldDefinition): unknown {
    if (field.name === 'countryCode' || field.name === 'teamCode') {
      return value.trim().toUpperCase();
    }

    return super.parseFieldValue(value, field);
  }
}
