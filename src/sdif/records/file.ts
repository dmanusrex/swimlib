/**
 * File Description (A0) Record Model
 *
 * Identifies the file and the type of data to be transmitted. Contact person
 * and phone number are included to assist with use of the information.
 * Mandatory; each file begins with exactly one record of this type.
 */

import { FieldRequirement, FieldType, type FieldDefinition } from '../fields';
import { FileCode, OrganizationCode } from '../codes';
import { SdifRecord, stringifyFieldValue } from './base';

export class FileDescription extends SdifRecord {
  readonly identifier = 'A0';

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
      name: 'sdifVersion',
      start: 4,
      length: 8,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
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
      name: 'softwareName',
      start: 44,
      length: 20,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'softwareVersion',
      start: 64,
      length: 10,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'contactName',
      start: 74,
      length: 20,
      type: FieldType.NAME,
      requirement: FieldRequirement.MANDATORY_M1,
    },
    {
      name: 'contactPhone',
      start: 94,
      length: 12,
      type: FieldType.PHONE,
      requirement: FieldRequirement.MANDATORY_M1,
      validate: (value) => stringifyFieldValue(value).trim().length > 0,
    },
    {
      name: 'fileCreation',
      start: 106,
      length: 8,
      type: FieldType.DATE,
      requirement: FieldRequirement.MANDATORY_M1,
    },
    {
      name: 'submittedByLsc',
      start: 156,
      length: 2,
      type: FieldType.USPS,
      requirement: FieldRequirement.OPTIONAL,
    },
  ];

  organization!: OrganizationCode;
  sdifVersion?: string;
  fileCode!: FileCode;
  softwareName?: string;
  softwareVersion?: string;
  contactName!: string;
  contactPhone!: string;
  fileCreation!: Date;
  submittedByLsc?: string;

  constructor(data?: Partial<FileDescription>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  protected formatFieldValue(value: unknown, field: FieldDefinition): string {
    if (field.name === 'contactPhone' && value) {
      // Keep any existing formatting, just ensure it fits in 12 chars
      return stringifyFieldValue(value).slice(0, 12).padEnd(12);
    }
    return super.formatFieldValue(value, field);
  }

  protected parseFieldValue(value: string, field: FieldDefinition): unknown {
    if (field.name === 'contactPhone') {
      return value.trim();
    }
    return super.parseFieldValue(value, field);
  }
}
