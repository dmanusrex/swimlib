/**
 * HY3 guardian-names record (DB).
 *
 * Stores six 20-character name fields in columns 2-121: father last name,
 * father first name, mother first name, secondary-contact last name, first
 * secondary-parent name, and second secondary-parent name.
 */
import { FieldRequirement, FieldType, type FieldDefinition } from '../fields';
import { CHECKSUM_FIELD, HytekRecord } from './base';

export class GuardianNamesRecord extends HytekRecord {
  readonly identifier = 'DB';

  protected readonly fields: FieldDefinition[] = [
    {
      name: 'fatherLastName',
      start: 3,
      length: 20,
      type: FieldType.NAME,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'fatherFirstName',
      start: 23,
      length: 20,
      type: FieldType.NAME,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'motherFirstName',
      start: 43,
      length: 20,
      type: FieldType.NAME,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'secondaryLastName',
      start: 63,
      length: 20,
      type: FieldType.NAME,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'secondaryParent1Name',
      start: 83,
      length: 20,
      type: FieldType.NAME,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'secondaryParent2Name',
      start: 103,
      length: 20,
      type: FieldType.NAME,
      requirement: FieldRequirement.OPTIONAL,
    },
    CHECKSUM_FIELD,
  ];

  fatherLastName?: string;
  fatherFirstName?: string;
  motherFirstName?: string;
  secondaryLastName?: string;
  secondaryParent1Name?: string;
  secondaryParent2Name?: string;
  checksum?: string;

  constructor(data?: Partial<GuardianNamesRecord>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }
}
