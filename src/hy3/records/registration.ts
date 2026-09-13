/**
 * HY3 registration record (D5).
 *
 * Stores the primary mail-to name at columns 2-41, secondary address line at
 * 42-71, fixed compatibility markers at 72-86, registration date at 87-90,
 * reserved space at 91-98, primary-city overflow at 99-106, and
 * secondary-city overflow at 107-116.
 */
import { FieldRequirement, FieldType, type FieldDefinition } from '../fields';
import { CHECKSUM_FIELD, HytekRecord } from './base';

const LITERAL_X = 'X';
const LITERAL_F = 'FFFFFFFFFFFFF';

export class RegistrationRecord extends HytekRecord {
  readonly identifier = 'D5';

  protected readonly fields: FieldDefinition[] = [
    {
      name: 'primaryMailTo',
      start: 3,
      length: 40,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'secondaryAddress2',
      start: 43,
      length: 30,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'literalX',
      start: 73,
      length: 1,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'literalF',
      start: 75,
      length: 13,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'registrationDate',
      start: 88,
      length: 4,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'primaryCityOverflow',
      start: 100,
      length: 8,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    {
      name: 'secondaryCityOverflow',
      start: 108,
      length: 10,
      type: FieldType.ALPHA,
      requirement: FieldRequirement.OPTIONAL,
    },
    CHECKSUM_FIELD,
  ];

  primaryMailTo?: string;
  secondaryAddress2?: string;
  /** Constant 'X' written at 0-based [72]; not real data. */
  literalX: string = LITERAL_X;
  /** Constant 'FFFFFFFFFFFFF' written at 0-based [74:86]; not real data. */
  literalF: string = LITERAL_F;
  registrationDate?: string;
  primaryCityOverflow?: string;
  secondaryCityOverflow?: string;
  checksum?: string;

  constructor(data?: Partial<RegistrationRecord>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  protected parseFieldValue(value: string, field: FieldDefinition): unknown {
    // The literal columns carry no data; accept anything and normalize.
    if (field.name === 'literalX') return LITERAL_X;
    if (field.name === 'literalF') return LITERAL_F;

    return super.parseFieldValue(value, field);
  }
}
