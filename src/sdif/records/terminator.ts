/**
 * File Terminator (Z0) Record Model
 *
 * Marks the end of the file and contains summary information.
 * Each file must end with exactly one Z0 record.
 */

import { FieldRequirement, FieldType, type FieldDefinition } from '../fields';
import { FileCode, OrganizationCode } from '../codes';
import { SdifRecord, stringifyFieldValue } from './base';

export class FileTerminatorRecord extends SdifRecord {
  readonly identifier = 'Z0';

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
      name: 'fileCode',
      start: 12,
      length: 2,
      type: FieldType.CODE,
      requirement: FieldRequirement.MANDATORY_M1,
      codeType: FileCode,
    },
    {
      name: 'notes',
      start: 14,
      length: 30,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'numBRecords',
      start: 44,
      length: 3,
      type: FieldType.INTEGER,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'numMeets',
      start: 47,
      length: 3,
      type: FieldType.INTEGER,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'numCRecords',
      start: 50,
      length: 4,
      type: FieldType.INTEGER,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'numTeams',
      start: 54,
      length: 4,
      type: FieldType.INTEGER,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'numDRecords',
      start: 58,
      length: 6,
      type: FieldType.INTEGER,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'numSwimmers',
      start: 64,
      length: 6,
      type: FieldType.INTEGER,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'numERecords',
      start: 70,
      length: 5,
      type: FieldType.INTEGER,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'numFRecords',
      start: 75,
      length: 6,
      type: FieldType.INTEGER,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'numGRecords',
      start: 81,
      length: 6,
      type: FieldType.INTEGER,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'batchNumber',
      start: 87,
      length: 5,
      type: FieldType.INTEGER,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'numNewMembers',
      start: 92,
      length: 3,
      type: FieldType.INTEGER,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'numRenewMembers',
      start: 95,
      length: 3,
      type: FieldType.INTEGER,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'numMemberChanges',
      start: 98,
      length: 3,
      type: FieldType.INTEGER,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'numMemberDeletes',
      start: 101,
      length: 3,
      type: FieldType.INTEGER,
      requirement: FieldRequirement.OPTIONAL,
    },
  ];

  organization?: OrganizationCode;
  fileCode!: FileCode;
  notes?: string;
  numBRecords?: number;
  numMeets?: number;
  numCRecords?: number;
  numTeams?: number;
  numDRecords?: number;
  numSwimmers?: number;
  numERecords?: number;
  numFRecords?: number;
  numGRecords?: number;
  batchNumber?: number;
  numNewMembers?: number;
  numRenewMembers?: number;
  numMemberChanges?: number;
  numMemberDeletes?: number;

  constructor(data?: Partial<FileTerminatorRecord>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  protected formatFieldValue(value: unknown, field: FieldDefinition): string {
    if (field.type === FieldType.INTEGER && value !== undefined && value !== null) {
      return stringifyFieldValue(value).padStart(field.length);
    }

    if (field.name === 'notes' && value) {
      return stringifyFieldValue(value).slice(0, field.length).padEnd(field.length);
    }

    return super.formatFieldValue(value, field);
  }

  protected parseFieldValue(value: string, field: FieldDefinition): unknown {
    if (field.type === FieldType.INTEGER) {
      const trimmed = value.trim();
      return trimmed ? parseInt(trimmed, 10) : undefined;
    }

    if (field.name === 'notes') {
      return value.trim() || undefined;
    }

    return super.parseFieldValue(value, field);
  }
}
