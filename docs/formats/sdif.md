# SDIF (`.SD3`) and Hy-Tek `.CL2` files — `swimlib/sdif`

SDIF (United States Swimming **S**tandard **D**ata **I**nterchange **F**ormat)
files consist of **160-character fixed-width records**, one per line
(CRLF-separated). The first two characters of each line identify the record
type. Field positions in the SDIF specification are **1-based**.

Hy-Tek `.CL2` files are the precursor to SD3 and use the same record layouts,
but omit several fields that SDIF v2 made mandatory. They are read by
relaxing those requirements (see [CL2 support](#cl2-support)).

## API

```ts
import { parseSdif, parseCl2, buildSdif } from 'swimlib/sdif';

const file = parseSdif(content); // string | Uint8Array (Windows-1252)
file.byType.individualEvents[0].finalsTime?.getHundredths();

const cl2 = parseCl2(content); // relaxed mandatory fields

const sd3: string = buildSdif(file); // validates + auto-appends Z0 terminator
```

`parseSdif` options:

- `treatM2AsOptional` — report missing SDIF v2 (M2) mandatory fields as
  warnings instead of errors; M1 fields stay enforced.
- `cl2` — turn off both M1 and M2 mandatory-field checks entirely (what
  `parseCl2` sets).
- `strict` — throw `SdifParseError` on unknown record types or validation
  failures instead of collecting warnings.

`buildSdif` options: `validate` (default `true`), `appendTerminator` (default
`true` — appends a `Z0` record copying `organization`/`fileCode` from the
`A0` when the last record isn't already a terminator).

## Record types

| ID  | Class                     | Contents                                    |
| --- | ------------------------- | ------------------------------------------- |
| A0  | `FileDescription`         | File type, software, contact, creation date |
| B1  | `MeetRecord`              | Meet name, address, dates, course           |
| B2  | `MeetHostRecord`          | Meet host name, address, phone              |
| C1  | `TeamRecord`              | Team code, names, address                   |
| C2  | `TeamEntryRecord`         | Coach and entry counts                      |
| D0  | `IndividualEventRecord`   | Swimmer + individual event entry/result     |
| D1  | `IndividualAdminRecord`   | Swimmer administrative info (registration)  |
| D2  | `IndividualContactRecord` | Swimmer mailing/contact info (registration) |
| D3  | `IndividualInfoRecord`    | New USS number, preferred name, ethnicity   |
| E0  | `RelayEventRecord`        | Relay event entry/result                    |
| F0  | `RelayNameRecord`         | Relay leg swimmers                          |
| G0  | `SplitRecord`             | Split times (up to 10 per record), round    |
| Z0  | `FileTerminatorRecord`    | End-of-file summary counts                  |

D1 and D2 are registration-oriented record types (USS registration file
submissions rather than meet results); several of their fields are marked in
the spec as required only "for submission of registration data to LSC" and
are modeled as optional.

Record classes expose `toRecord()` / `RecordClass.fromRecord(line)` /
`validate(options)`; field layouts (1-based `start`, `length`, type,
requirement) are declared in each class's `fields` array and are readable via
`getFieldDefinitions()`.

## Field requirement levels and CL2 support

Every field carries one of three requirement levels (the spec's M1/M2
flags):

| Level          | Meaning                                                                     |
| -------------- | --------------------------------------------------------------------------- |
| `MANDATORY_M1` | Required - Can not be relaxed for normal parsing                            |
| `MANDATORY_M2` | Required — missing value is an error, or a warning with `treatM2AsOptional` |
| `OPTIONAL`     | Never required                                                              |

CL2 files predate SDIF v3, so fields at either mandatory level — like
`organization`, `ussn`, and `birthdate` (all `MANDATORY_M2`) — can be
absent. `parseCl2` / `{ cl2: true }` turns off both M1 and M2 checks and
accepts such records without validation errors or warnings. **Writing CL2
is not supported**

## Times

Time fields parse into the `SwimTime` class (`swimlib/core`), which holds
either a duration in hundredths of a second or a special code: `NT` (no
time), `DQ`, `SCR` (scratch), `NS` (no show), `FS` (false start), `DNF`.
Formatting is right-justified in 8 characters (e.g. `' 1:05.32'`).

## Code tables

`swimlib/sdif` exports the SDIF v3 code tables as as-const objects:
`OrganizationCode` (001), `CountryCode` (004), `FileCode` (003),
`MeetTypeCode` (005), `CitizenshipCode` (009), `SexCode` (010),
`EventSexCode` (011), `StrokeCode` (012), `CourseStatusCode` (013),
`EventTimeClassCode` (014), `SplitCode` (015), `AttachCode` (016),
`PrelimsFinalsCode` (019), `MemberCode` (021), `SeasonCode` (022),
`OrderCode` (024), `EthnicityCode` (026), `TimeCode`.

Note on `CourseStatusCode`: the spec defines `1`/`S` (short course meters),
`2`/`Y` (short course yards), `3`/`L` (long course meters) and `X`
(disqualified) — there is no `M` in the spec, but real-world files may use `M` for short course meters. All
variants are accepted; `normalizeCourseCode(code)` collapses them to the
canonical letters (`1`/`S` → `M`, `2` → `Y`, `3` → `L`, identity otherwise).

## Round-trip guarantee

`buildSdif(parseSdif(content))` is byte-identical for files this library
produces. For arbitrary third-party files the guarantee is **semantic**:
values survive, but padding of free-text fields is normalized to the spec
layout.
