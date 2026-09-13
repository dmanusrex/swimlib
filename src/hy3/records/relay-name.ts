/**
 * F3 lists swimmers for a relay. Up to eight 13-character slots begin at
 * offset 2. Each slot contains sex (1), a right-aligned swimmer key (5),
 * surname abbreviation (5), category (1), and relay order (1).
 *
 * Slots one through four hold the entered relay. Team Manager exports can use
 * later slots for alternates, so all eight slots are preserved.
 */
import { FieldRequirement, FieldType, type FieldDefinition } from '../fields';
import { SexCode } from '../codes';
import { CHECKSUM_FIELD, HytekRecord } from './base';

/** Number of swimmer slots on an F3 line. */
const SWIMMER_SLOTS = 8;

/** Width of one swimmer slot: gender + id(5) + abbr(5) + gender2 + leg. */
const SLOT_WIDTH = 13;

function buildSwimmerFields(): FieldDefinition[] {
  const fields: FieldDefinition[] = [];
  for (let n = 1; n <= SWIMMER_SLOTS; n++) {
    const base = 3 + SLOT_WIDTH * (n - 1); // 1-based start of slot n
    // Slots 1-4 are the relay legs proper; 5-8 are alternates and optional.
    const requirement = n <= 4 ? FieldRequirement.MANDATORY : FieldRequirement.OPTIONAL;
    fields.push(
      {
        name: `swimmer${n}Gender`,
        start: base,
        length: 1,
        type: FieldType.CODE,
        requirement,
        codeType: SexCode,
      },
      {
        name: `swimmer${n}Id`,
        start: base + 1,
        length: 5,
        type: FieldType.USS_NUM,
        requirement,
        justify: 'right',
      },
      {
        name: `swimmer${n}Abbr`,
        start: base + 6,
        length: 5,
        type: FieldType.ALPHA,
        requirement,
      },
      {
        name: `swimmer${n}Gender2`,
        start: base + 11,
        length: 1,
        type: FieldType.CODE,
        requirement,
        codeType: SexCode,
      },
      {
        name: `swimmer${n}RelayLeg`,
        start: base + 12,
        length: 1,
        type: FieldType.INTEGER,
        requirement,
      },
    );
  }
  fields.push(CHECKSUM_FIELD);
  return fields;
}

export class RelayNameRecord extends HytekRecord {
  readonly identifier = 'F3';

  protected readonly fields: FieldDefinition[] = buildSwimmerFields();

  swimmer1Gender!: SexCode;
  swimmer1Id!: string;
  swimmer1Abbr!: string;
  swimmer1Gender2!: SexCode;
  swimmer1RelayLeg!: number;
  swimmer2Gender!: SexCode;
  swimmer2Id!: string;
  swimmer2Abbr!: string;
  swimmer2Gender2!: SexCode;
  swimmer2RelayLeg!: number;
  swimmer3Gender!: SexCode;
  swimmer3Id!: string;
  swimmer3Abbr!: string;
  swimmer3Gender2!: SexCode;
  swimmer3RelayLeg!: number;
  swimmer4Gender!: SexCode;
  swimmer4Id!: string;
  swimmer4Abbr!: string;
  swimmer4Gender2!: SexCode;
  swimmer4RelayLeg!: number;
  swimmer5Gender?: SexCode;
  swimmer5Id?: string;
  swimmer5Abbr?: string;
  swimmer5Gender2?: SexCode;
  swimmer5RelayLeg?: number;
  swimmer6Gender?: SexCode;
  swimmer6Id?: string;
  swimmer6Abbr?: string;
  swimmer6Gender2?: SexCode;
  swimmer6RelayLeg?: number;
  swimmer7Gender?: SexCode;
  swimmer7Id?: string;
  swimmer7Abbr?: string;
  swimmer7Gender2?: SexCode;
  swimmer7RelayLeg?: number;
  swimmer8Gender?: SexCode;
  swimmer8Id?: string;
  swimmer8Abbr?: string;
  swimmer8Gender2?: SexCode;
  swimmer8RelayLeg?: number;
  checksum?: string;

  constructor(data?: Partial<RelayNameRecord>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }
}
