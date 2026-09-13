/**
 * Individual Info (D3) Record Model
 *
 * Provides space for the new USS# as well as the swimmer's preferred first
 * name. For meet files this record follows the D0 record (and the F0 record
 * if relays are included). A swimmer with multiple D0 records has one D3
 * record following their first D0 record.
 */

import { FieldRequirement, FieldType, type FieldDefinition } from '../fields';
import { EthnicityCode } from '../codes';
import { SdifRecord, stringifyFieldValue } from './base';

export class IndividualInfoRecord extends SdifRecord {
  readonly identifier = 'D3';

  protected readonly fields: FieldDefinition[] = [
    {
      name: 'ussNumber',
      start: 3,
      length: 14,
      type: FieldType.USS_NUM,
      requirement: FieldRequirement.MANDATORY_M2,
    },
    {
      name: 'preferredFirstName',
      start: 17,
      length: 15,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'ethnicity1',
      start: 32,
      length: 1,
      type: FieldType.CODE,
      requirement: FieldRequirement.OPTIONAL,
      codeType: EthnicityCode,
    },
    {
      name: 'ethnicity2',
      start: 33,
      length: 1,
      type: FieldType.CODE,
      requirement: FieldRequirement.OPTIONAL,
      codeType: EthnicityCode,
    },
    {
      name: 'juniorHigh',
      start: 34,
      length: 1,
      type: FieldType.LOGICAL,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'seniorHigh',
      start: 35,
      length: 1,
      type: FieldType.LOGICAL,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'ymcaYwca',
      start: 36,
      length: 1,
      type: FieldType.LOGICAL,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'college',
      start: 37,
      length: 1,
      type: FieldType.LOGICAL,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'summerLeague',
      start: 38,
      length: 1,
      type: FieldType.LOGICAL,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'masters',
      start: 39,
      length: 1,
      type: FieldType.LOGICAL,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'disabledSportsOrg',
      start: 40,
      length: 1,
      type: FieldType.LOGICAL,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'waterPolo',
      start: 41,
      length: 1,
      type: FieldType.LOGICAL,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'none',
      start: 42,
      length: 1,
      type: FieldType.LOGICAL,
      requirement: FieldRequirement.OPTIONAL,
    },
  ];

  ussNumber?: string;
  preferredFirstName?: string;
  ethnicity1?: EthnicityCode;
  ethnicity2?: EthnicityCode;
  juniorHigh?: boolean;
  seniorHigh?: boolean;
  ymcaYwca?: boolean;
  college?: boolean;
  summerLeague?: boolean;
  masters?: boolean;
  disabledSportsOrg?: boolean;
  waterPolo?: boolean;
  none?: boolean;

  constructor(data?: Partial<IndividualInfoRecord>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  protected formatFieldValue(value: unknown, field: FieldDefinition): string {
    if ((field.name === 'ussNumber' || field.name === 'preferredFirstName') && value) {
      return stringifyFieldValue(value).slice(0, field.length).padEnd(field.length);
    }

    // Unset logical fields stay blank rather than 'F'
    if (field.type === FieldType.LOGICAL) {
      if (value === undefined || value === null) {
        return ' '.padEnd(field.length);
      }
      return (value ? 'T' : 'F').padEnd(field.length);
    }

    return super.formatFieldValue(value, field);
  }

  protected parseFieldValue(value: string, field: FieldDefinition): unknown {
    if (field.name === 'ussNumber' || field.name === 'preferredFirstName') {
      return value.trim() || undefined;
    }

    if (field.type === FieldType.LOGICAL) {
      const trimmed = value.trim();
      if (!trimmed) return undefined;
      return trimmed.toUpperCase() === 'T';
    }

    return super.parseFieldValue(value, field);
  }
}
