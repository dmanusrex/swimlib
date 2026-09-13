import { describe, expect, it } from 'vitest';
import { FieldType, RECORD_LENGTH, RECORD_TYPES } from '../../src/hy3/index';

/**
 * Guards against field-definition drift: every field's `name` must be a real
 * declared property on its record class (the base class reads values via
 * reflection, so a mismatch silently serializes blanks — exactly the bug the
 * old library's F1 record had), and field spans must stay within the
 * 128-character content area. Only the CHECKSUM field may extend to 130.
 */
describe('hy3 field-map integrity', () => {
  for (const [type, Model] of Object.entries(RECORD_TYPES)) {
    describe(`${type} (${Model.name})`, () => {
      const probe = new Model();
      const fields = probe.getFieldDefinitions();

      it('every field name is a declared property or assignable', () => {
        // Constructing with Partial data must round-trip through toRecord:
        // set a marker on each ALPHA/NAME field and confirm it lands in
        // the serialized output (proves name ↔ property agreement).
        for (const field of fields) {
          if (field.type !== 'alpha' && field.type !== 'name') continue;
          const marker = 'Z'.repeat(Math.min(field.length, 3));
          const instance = new Model({ [field.name]: marker });
          const line = instance.toRecord();
          // Some overrides right-justify (e.g. E1.eventNumber), so only
          // require the marker to appear within the field's span.
          const slice = line.substring(field.start - 1, field.start - 1 + field.length);
          expect(slice.includes(marker), `${type}.${field.name}`).toBe(true);
        }
      });

      it('fields stay within the content area and do not overlap', () => {
        const seen: { name: string; start: number; end: number }[] = [];
        for (const field of fields) {
          const start = field.start;
          const end = field.start + field.length - 1;
          expect(start, `${type}.${field.name} start`).toBeGreaterThanOrEqual(3);
          if (field.type === FieldType.CHECKSUM) {
            // The checksum is exactly the last two characters of the line.
            expect(start, `${type}.${field.name} start`).toBe(RECORD_LENGTH - 1);
            expect(end, `${type}.${field.name} end`).toBe(RECORD_LENGTH);
          } else {
            expect(end, `${type}.${field.name} end`).toBeLessThanOrEqual(RECORD_LENGTH - 2);
          }
          for (const other of seen) {
            const overlaps = start <= other.end && end >= other.start;
            expect(overlaps, `${type}.${field.name} overlaps ${other.name}`).toBe(false);
          }
          seen.push({ name: field.name, start, end });
        }
      });

      it('field names are unique', () => {
        const names = fields.map((f) => f.name);
        expect(new Set(names).size).toBe(names.length);
      });

      it('declares exactly one checksum field', () => {
        expect(fields.filter((f) => f.type === FieldType.CHECKSUM).length).toBe(1);
      });
    });
  }
});
