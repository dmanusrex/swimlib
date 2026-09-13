/**
 * HY3 guardian-phone record (DD).
 *
 * Stores six 20-character phone fields in columns 2-121: father cell, mother
 * office, mother cell, first secondary-parent cell, second secondary-parent
 * office, and second secondary-parent cell.
 */
import { FieldRequirement, FieldType, type FieldDefinition } from '../fields';
import { CHECKSUM_FIELD, HytekRecord } from './base';

export class GuardianPhonesRecord extends HytekRecord {
  readonly identifier = 'DD';

  protected readonly fields: FieldDefinition[] = [
    {
      name: 'fatherCellPhone',
      start: 3,
      length: 20,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'motherOfficePhone',
      start: 23,
      length: 20,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'motherCellPhone',
      start: 43,
      length: 20,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'secondaryParent1CellPhone',
      start: 63,
      length: 20,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'secondaryParent2OfficePhone',
      start: 83,
      length: 20,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'secondaryParent2CellPhone',
      start: 103,
      length: 20,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    CHECKSUM_FIELD,
  ];

  fatherCellPhone?: string;
  motherOfficePhone?: string;
  motherCellPhone?: string;
  secondaryParent1CellPhone?: string;
  secondaryParent2OfficePhone?: string;
  secondaryParent2CellPhone?: string;
  checksum?: string;

  constructor(data?: Partial<GuardianPhonesRecord>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }
}
