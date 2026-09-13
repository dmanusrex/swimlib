# Architecture

Companion to [CLAUDE.md](../CLAUDE.md). Byte-level format specs live in
[formats/](formats/).

## Two module styles (intentional)

The five format modules share the same **public** shape — sync
`parseX`/`buildX`, `warnings` array, core error hierarchy — but two internal
styles were deliberately kept from the original code:

**Functional (rec, std, ev3):** `layout.ts`/`fields.ts` (offsets/field
orders) → `types.ts` (plain interfaces) → `parse.ts` → `build.ts` →
`index.ts` barrel. Layout tables carry runtime self-checks
(`assertContiguous` etc.) that run at module load.

**Record classes (sdif, hy3):** class per record type extending an abstract
base (`SdifRecord` / `HytekRecord`) in `records/base.ts`. Each class declares
a `fields: FieldDefinition[]` array (`{name, start (1-based per spec),
length, type, requirement, codeType?}`) and matching camelCase properties.
The base serializes/parses via reflection (`(this as Record<string,
unknown>)[field.name]`) — which is why **every record class must have a
field-map integrity test** (`tests/{sdif,hy3}/field-map.test.ts` marker
round-trip): a field-name/property mismatch silently writes blanks.
Subclasses override `formatFieldValue`/`parseFieldValue` for quirks
(right-justified event numbers, uppercase team codes, `'      NT'` seed-time
default, …).

## src/core contents

| File                 | Provides                                                                                                                                 |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `errors.ts`          | `SwimLibError` → `SwimLibParseError`/`SwimLibBuildError`; `SwimLibWarning` `{code, message, line?}`                                      |
| `swimtime.ts`        | `SwimTime` — hundredths or special code (NT/DQ/SCR/NS/FS/DNF); `fromCentiseconds`/`toCentiseconds` bridge for EV3                        |
| `windows1252.ts`     | Hand-rolled codec (Hy-Tek's native encoding); encode throws on unmappable chars                                                          |
| `hytek-timecodec.ts` | `decodeHytekTime`/`encodeHytekTime` — modified float32-LE (exponent byte +2), used by REC and STD                                        |
| `dates.ts`           | `CalendarDate`, `formatMmddyy`/`parseMmddyy` (+ explicit-century variants)                                                               |
| `codes.ts`           | `TimeCode` only — genuinely shared. Format-specific tables stay per-module (the formats assign conflicting meanings to the same letters) |

## Time representations (three, deliberate)

1. `SwimTime` class — SDIF and HY3 character fields.
2. Hy-Tek modified float32 — REC/STD binary words (surfaced as `seconds: number`).
3. EV3 — string times (`"1:23.45"`) plus computed `*_cs` centisecond ints
   (`*_cs` are output-only; the writer serializes the strings).

## Round-trip mechanics

- **REC/STD**: parsed records stash raw byte regions (`rawTimeBytes`,
  `holderRaw`, `trailingPad`, `timesRegionRaw`, …); build writes them back
  verbatim → byte-identical. Omit the raw fields to re-encode from values.
- **EV3**: parser normalizes empty times to `'0.00'`; writer reverses that
  (writes empty). `buildEv3` computes the header check digit;
  `{preserveCheckDigit: true}` reproduces files with bad stored digits.
- **SDIF/HY3**: byte-identical only for self-produced files; third-party
  files round-trip semantically (padding normalized to spec layout).

## Checksums (all different)

| Format  | Where                 | Algorithm                                                                                                                                      |
| ------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| REC/STD | none                  | —                                                                                                                                              |
| EV3     | last header field     | Σ charCodes → `trunc((sum-4)/9)+52` 4-digit → `d[3]+d[0..2]+line[2]`                                                                           |
| HY3     | last 2 chars per line | Σ charCodes over chars 0–127 (odd 0-based idx ×2) → `floor(/21)+205` → last two digits reversed. **Validated** (5/5 authentic spec sample rows |
| SDIF    | none                  | —                                                                                                                                              |

## Testing patterns

- Format fixtures (`tests/fixtures/`): `synthetic.rec.b64`, `test_std.st2`,
  `sample-meet.ev3` (its `12345` check digit is deliberately
  invalid — it's the checksum-warning test case), and `Sample Roster.HY3`
  (mock-data TM8 roster export; the wired-in byte-identical round-trip
  test). Two UNSANITIZED TM8 exports (`HytekTM8*`, real names/birth dates)
  are **gitignored** — local verification only, never commit, no committed
  test may reference them; sanitized versions to come from the user.
  **No real .sd3/.cl2 yet** — SDIF tests are synthetic.
- Per-module: fixture round-trips (byte equality), per-record round-trips,
  field-map integrity (sdif/hy3), checksum vectors, e2e synthetic files.
- CI (`.github/workflows/ci.yml`): lint+typecheck, tests on Node 20/22/24,
  build + `publint` + `@arethetypeswrong/cli --pack`.
