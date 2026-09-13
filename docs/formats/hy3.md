# Hy-Tek `.HY3` meet entry files — `swimlib/hy3`

HY3 is Hy-Tek's fixed-width interchange format for meet entries: each line is
a **130-character record** — 128 content characters followed by a
**2-character checksum** — separated by CRLF. The first two characters of
each line identify the record type.

> **Scope**: entries, roster, and results record types are implemented. B3
> is a known record type that remains **unimplemented** (no authoritative
> layout exists in any reference). The per-record byte layouts are
> documented as ASCII column maps or 0-based range tables in each
> `src/hy3/records/*.ts` file.
>
> **Validation status**: the module has been reconciled against real Hy-Tek
> TEAM MANAGER 8 output — a roster export ('03'), a meet-entries export
> ('02') and a results export ('09'). All checksums in all three files
> verify, and `buildHy3(parseHy3(file).records)` reproduces each of the
> three files **byte-for-byte** (the roster round-trip is asserted by
> `tests/hy3/roster-fixture.test.ts`).

## API

```ts
import { parseHy3, buildHy3 } from 'swimlib/hy3';

const { records, byType, warnings } = parseHy3(content); // string | Uint8Array
const content2: string = buildHy3(records); // computes each line's checksum
```

`parseHy3` options: `{ checksum: 'warn' | 'error' | 'ignore' }` (default
`'warn'` — mismatches become `checksum-mismatch` warnings; `'error'` throws
`Hy3ParseError`; `'ignore'` skips verification). Unknown record types are
collected as `unknown-record-type` warnings.

## Record types

### File

| ID  | Class             | Contents                                                          |
| --- | ----------------- | ----------------------------------------------------------------- |
| A1  | `FileDescription` | File type code, description, software vendor/name, date, licensee |

`FileCode` values are HY3-specific : `'01'` merge meet entries, `'02'` meet entries (TM to MM), `'03'`
team roster, `'04'` merge meet results, `'07'` results exported from
**Meet Manager** (MM to TM), `'08'` merge advancer entries, `'09'` results
exported from **Team Manager** (real TM8 writes `'09'` with the description
`Exported Results`).

The A1 creation time is **right-justified** in its 8-character column
(`' 3:23 PM'`), per real TM8 output.

### Meet

| ID  | Class            | Contents                                        |
| --- | ---------------- | ----------------------------------------------- |
| B1  | `MeetRecord`     | Meet name, facility, dates, elevation           |
| B2  | `MeetTypeRecord` | Masters flag, meet type, course codes, meet fee |

### Team

| ID  | Class               | Contents                                         |
| --- | ------------------- | ------------------------------------------------ |
| C1  | `TeamRecord`        | Team code, names, LSC, coach names, team type    |
| C2  | `TeamAddressRecord` | Team mailing address, registration (USS/BCSS/…)  |
| C3  | `TeamContactRecord` | Team phone/fax/email                             |
| C6  | `TeamStaffRecord`   | One coach/staff member per record: name and role |

### Swimmer

| ID  | Class                           | Contents                                                                                       |
| --- | ------------------------------- | ---------------------------------------------------------------------------------------------- |
| D1  | `IndividualInfoRecord`          | Swimmer identity, USS number, school year, group/subgroup, inactive flag, registration country |
| D2  | `SwimmerAddressRecord`          | Primary contact address                                                                        |
| D3  | `SwimmerPhoneRecord`            | Primary contact phones, fax, email                                                             |
| D4  | `SecondaryContactAddressRecord` | Secondary contact mail-to and address                                                          |
| D5  | `RegistrationRecord`            | Registration date, literals, city overflow bytes                                               |
| D6  | `EmergencyContactRecord`        | Doctor and emergency contact name/phone                                                        |
| D7  | `SecondaryContactPhoneRecord`   | Secondary contact phones, fax, email                                                           |
| D8  | `MedicalConditionRecord`        | Medical condition description                                                                  |
| D9  | `MedicationRecord`              | Medication description                                                                         |
| DA  | `CustomFieldsRecord`            | Three custom field name/value pairs                                                            |
| DB  | `GuardianNamesRecord`           | Father/mother/secondary guardian names                                                         |
| DC  | `FillerRecord`                  | No data (blank body placeholder)                                                               |
| DD  | `GuardianPhonesRecord`          | Guardian cell/office phones                                                                    |
| DE  | `MotherEmailRecord`             | Mother email (+ overflow) and last name                                                        |
| DF  | `SwimmerContactRecord`          | Swimmer's own middle name, cell phone, email                                                   |

### Entries and results

| ID  | Class                    | Contents                                                       |
| --- | ------------------------ | -------------------------------------------------------------- |
| E1  | `IndividualEventRecord`  | Individual event entry with seed times                         |
| E2  | `IndividualResultRecord` | Individual result: round, time, heat/lane/place, backups       |
| F1  | `RelayTeamRecord`        | Relay team entry with seed times                               |
| F2  | `RelayResultRecord`      | Relay result: round, time, places, touchpad, per-leg reactions |
| F3  | `RelayNameRecord`        | Relay leg swimmers                                             |

E2/F2 follow their E1/F1 entry record for each swum round. The `round`
column uses `RoundCode` (`P` prelims, `F` finals, `S` semifinals, `T` time
trials). What older references describe as a 3-character "time code" is two
fields: a 1-character **result status** at 0-based [12] (`ResultStatusCode`:
`Q` DQ, `R` no start/show, `S` scratch, `F` false start, blank normal)
followed by a 2-character **DQ reason code** at [13:14] (e.g. `Q3H` on a
real DQ; the matching H1 record spells out reason `3H`). F2 additionally
carries an `X` at 0-based [15] on exhibition swims (`exhibitionFlag`).

**Times are raw seconds.** Hy-Tek writes every HY3 time as seconds with two
decimals, never minute-formatted: `'138.08'` means 2:18.08 (`SwimTime`
parses both forms; the builder always emits the raw-seconds form). A zero
E1/F1 _conversion_ seed is written as a bare `'0'`; every other zero time
is `'0.00'`.

**Points columns** (validated against a real TM8 results export): E2/F2
carry points right-justified at 0-based [60:62] in **tenths of a point**
(`'40'` = 4.0); the matching E1/F1 records carry the same points as a
two-decimal number at [60:67] (`'4.00'`)

### Splits and disqualifications

| ID  | Class                 | Contents                           |
| --- | --------------------- | ---------------------------------- |
| G1  | `SplitRecord`         | Split times                        |
| H1  | `DqDescriptionRecord` | DQ reason code and its description |

An H1 follows a disqualified E2/F2 result: the 2-character DQ reason code
at 0-based [2:3] (repeating the result's code at [13:14]) and the
free-text description at [4:127].

Known but **unimplemented** (no authoritative layout): B3 meet contact.

Record classes expose `toRecord()` (serialize to a 130-char line including
checksum) and `RecordClass.fromRecord(line)` (parse), plus `validate()`.

### Stroke codes

`A` Free, `B` Back, `C` Breast, `D` Fly, `E` Medley, plus `F`/`G`/`H` for
1m/3m/10m diving.

### Generator-file order

Generate meet-entries files in the order
`A1 → B1 → B2 → C1 → C2 → C3 → (per swimmer) D1..DF → E1s → F1 + F3`.
Real TM8 entries exports additionally emit `C6` staff records after `C3`;
TM8 roster exports ('03') carry no B records:
`A1 → C1 → C2 → C3 → (per swimmer) D1..DF`.

## Checksum

For each line, the checksum over the first 128 characters is:

1. `sum = Σ charCode(c[i]) × (i % 2 === 0 ? 1 : 2)` for `i` in `0..127`
   (0-based; odd positions doubled).
2. `checkVal = floor(sum / 21) + 205`.
3. The checksum is the **last two digits of `checkVal`, reversed**
   (e.g. `checkVal = 337` → `'37'` → `'73'`).

`toRecord()` computes and embeds the checksum at positions 129–130 (1-based);
`parseHy3` verifies each line against `computeHy3Checksum`. Lines shorter
than 130 characters are space-padded before processing.

## Text encoding

`Uint8Array` input is decoded as Windows-1252 (Hy-Tek's native encoding).
`buildHy3` returns a string; use `encodeWindows1252` from `swimlib/core` to
produce on-disk bytes.
