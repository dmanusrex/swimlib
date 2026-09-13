/**
 * G1 stores up to ten split values. Eleven-character slots begin at offset 2
 * and contain result type (1), split length (2), and time (8). Real records
 * may contain fewer than ten splits, so every slot is optional.
 */
import { SwimTime } from '../../core/swimtime';
import { FieldRequirement, FieldType, type FieldDefinition } from '../fields';
import { ResultTypeCode } from '../codes';
import { CHECKSUM_FIELD, HytekRecord } from './base';

/** Number of split slots on a G1 line. */
const SPLIT_SLOTS = 10;

/** Width of one split slot: result type (1) + length (2) + time (8). */
const SLOT_WIDTH = 11;

function buildSplitFields(): FieldDefinition[] {
  const fields: FieldDefinition[] = [];
  for (let n = 1; n <= SPLIT_SLOTS; n++) {
    const base = 3 + SLOT_WIDTH * (n - 1); // 1-based start of slot n
    fields.push(
      {
        name: `splitResultType${n}`,
        start: base,
        length: 1,
        type: FieldType.CODE,
        requirement: FieldRequirement.OPTIONAL,
        codeType: ResultTypeCode,
      },
      {
        name: `splitLength${n}`,
        start: base + 1,
        length: 2,
        type: FieldType.INTEGER,
        requirement: FieldRequirement.OPTIONAL,
      },
      {
        name: `splitTime${n}`,
        start: base + 3,
        length: 8,
        type: FieldType.TIME,
        requirement: FieldRequirement.OPTIONAL,
      },
    );
  }
  fields.push(CHECKSUM_FIELD);
  return fields;
}

export class SplitRecord extends HytekRecord {
  readonly identifier = 'G1';

  protected readonly fields: FieldDefinition[] = buildSplitFields();

  splitResultType1?: ResultTypeCode;
  splitLength1?: number;
  splitTime1?: SwimTime;
  splitResultType2?: ResultTypeCode;
  splitLength2?: number;
  splitTime2?: SwimTime;
  splitResultType3?: ResultTypeCode;
  splitLength3?: number;
  splitTime3?: SwimTime;
  splitResultType4?: ResultTypeCode;
  splitLength4?: number;
  splitTime4?: SwimTime;
  splitResultType5?: ResultTypeCode;
  splitLength5?: number;
  splitTime5?: SwimTime;
  splitResultType6?: ResultTypeCode;
  splitLength6?: number;
  splitTime6?: SwimTime;
  splitResultType7?: ResultTypeCode;
  splitLength7?: number;
  splitTime7?: SwimTime;
  splitResultType8?: ResultTypeCode;
  splitLength8?: number;
  splitTime8?: SwimTime;
  splitResultType9?: ResultTypeCode;
  splitLength9?: number;
  splitTime9?: SwimTime;
  splitResultType10?: ResultTypeCode;
  splitLength10?: number;
  splitTime10?: SwimTime;
  checksum?: string;

  constructor(data?: Partial<SplitRecord>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }
}
