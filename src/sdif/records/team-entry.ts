/**
 * Team Entry (C2) Record Model
 *
 * Contains team entry information for a specific meet.
 * Each C2 record is associated with a parent C1 (Team) record.
 */

import { FieldRequirement, FieldType, type FieldDefinition } from '../fields';
import { OrganizationCode } from '../codes';
import { SdifRecord, stringifyFieldValue } from './base';

export class TeamEntryRecord extends SdifRecord {
  readonly identifier = 'C2';

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
      requirement: FieldRequirement.MANDATORY_M2,
    },
    {
      name: 'coachName',
      start: 18,
      length: 30,
      type: FieldType.NAME,
      requirement: FieldRequirement.MANDATORY_M2,
    },
    {
      name: 'coachPhone',
      start: 48,
      length: 12,
      type: FieldType.PHONE,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'nEntries',
      start: 60,
      length: 6,
      type: FieldType.INTEGER,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'nAthletes',
      start: 66,
      length: 6,
      type: FieldType.INTEGER,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'nRelayEntries',
      start: 72,
      length: 5,
      type: FieldType.INTEGER,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'nRelayNameEntries',
      start: 77,
      length: 6,
      type: FieldType.INTEGER,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'nSplitRecords',
      start: 83,
      length: 6,
      type: FieldType.INTEGER,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'shortName',
      start: 89,
      length: 16,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'teamCode5',
      start: 150,
      length: 1,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
  ];

  organization?: OrganizationCode;
  teamCode?: string;
  coachName?: string;
  coachPhone?: string;
  nEntries?: number;
  nAthletes?: number;
  nRelayEntries?: number;
  /** Number of relay name entries from this team (F0 records). */
  nRelayNameEntries?: number;
  nSplitRecords?: number;
  shortName?: string;
  teamCode5?: string;

  constructor(data?: Partial<TeamEntryRecord>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  protected formatFieldValue(value: unknown, field: FieldDefinition): string {
    if (field.name === 'teamCode' && value) {
      return stringifyFieldValue(value).toUpperCase().slice(0, field.length).padEnd(field.length);
    }

    if (field.type === FieldType.INTEGER && value !== undefined && value !== null) {
      return stringifyFieldValue(value).slice(-field.length).padStart(field.length);
    }

    // Phone numbers keep original formatting, just constrained to length
    if (field.name === 'coachPhone' && value) {
      return stringifyFieldValue(value).slice(0, field.length).padEnd(field.length);
    }

    return super.formatFieldValue(value, field);
  }

  protected parseFieldValue(value: string, field: FieldDefinition): unknown {
    if (field.name === 'teamCode') {
      return value.trim().toUpperCase();
    }

    if (field.type === FieldType.INTEGER) {
      const trimmed = value.trim();
      return trimmed ? parseInt(trimmed, 10) : undefined;
    }

    if (field.name === 'coachPhone') {
      return value.trim();
    }

    return super.parseFieldValue(value, field);
  }
}
