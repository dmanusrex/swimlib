import { describe, expect, it } from 'vitest';
import { RECORD_LENGTH, RECORD_TYPES } from '../../src/sdif/index';

/**
 * Guards against field-definition drift: every field's `name` must be a real
 * declared property on its record class (the base class reads values via
 * reflection, so a mismatch silently serializes blanks), and field spans
 * must stay within the 160-character record.
 */
describe('sdif field-map integrity', () => {
  for (const [type, Model] of Object.entries(RECORD_TYPES)) {
    describe(`${type} (${Model.name})`, () => {
      // Instantiate with every field name set so reflection lookups resolve.
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
          // Some overrides right-justify (e.g. D0.eventNumber), so only
          // require the marker to appear within the field's span.
          const slice = line.substring(field.start - 1, field.start - 1 + field.length);
          expect(slice.includes(marker), `${type}.${field.name}`).toBe(true);
        }
      });

      it('fields stay within the record and do not overlap', () => {
        const seen: { name: string; start: number; end: number }[] = [];
        for (const field of fields) {
          const start = field.start;
          const end = field.start + field.length - 1;
          expect(start, `${type}.${field.name} start`).toBeGreaterThanOrEqual(3);
          expect(end, `${type}.${field.name} end`).toBeLessThanOrEqual(RECORD_LENGTH);
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
    });
  }
});
