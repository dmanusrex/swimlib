/**
 * HY3 file-header record (A1).
 *
 * Stores the file code at columns 2-3, description at 4-28, vendor at 29-43,
 * software name at 44-57, creation date at 58-65, a reserved column at 66,
 * creation time at 67-74, and licensee at 75-126. The description and vendor
 * widths follow the non-overlapping layout emitted by observed exports.
 */
import { FieldRequirement, FieldType, type FieldDefinition } from '../fields';
import { FileCode } from '../codes';
import { CHECKSUM_FIELD, HytekRecord } from './base';

export class FileDescription extends HytekRecord {
  readonly identifier = 'A1';

  protected readonly fields: FieldDefinition[] = [
    {
      name: 'fileCode',
      start: 3,
      length: 2,
      type: FieldType.CODE,
      requirement: FieldRequirement.MANDATORY,
      codeType: FileCode,
    },
    {
      name: 'fileDescription',
      start: 5,
      length: 25,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.MANDATORY,
    },
    {
      name: 'softwareVendor',
      start: 30,
      length: 15,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.MANDATORY,
    },
    {
      name: 'softwareName',
      start: 45,
      length: 14,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.MANDATORY,
    },
    {
      name: 'creationDate',
      start: 59,
      length: 8,
      type: FieldType.DATE,
      requirement: FieldRequirement.MANDATORY,
    },
    // 1-based position 67 (0-based [66]) is unused.
    {
      // Right-justified: real TM8 writes ' 3:23 PM' in 0-based [67:74]
      // (verified against TM8 roster/entries/results exports).
      name: 'creationTime',
      start: 68,
      length: 8,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.MANDATORY,
      justify: 'right',
    },
    {
      name: 'licensee',
      start: 76,
      length: 52,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.MANDATORY,
    },
    CHECKSUM_FIELD,
  ];

  fileCode!: FileCode;
  fileDescription!: string;
  softwareVendor!: string;
  softwareName!: string;
  creationDate!: Date;
  creationTime!: string;
  licensee!: string;
  checksum?: string;

  constructor(data?: Partial<FileDescription>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }
}
