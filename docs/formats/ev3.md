# Hy-Tek `.EV3` event files — `swimlib/ev3`

EV3 files are semicolon-delimited text files exported by Hy-Tek Meet Manager
describing a meet's event program:

- **Header line**: meet and pool information — 35 fields, the last of which is
  a check digit computed over the rest of the line.
- **Event lines**: one per event — 30 fields with age groups, qualifying
  times, and session details.

There is no quoting in the format; fields may not contain `;` or line breaks.
Lines end with CRLF (including a trailing CRLF after the last line).

## API

```ts
import { parseEv3, buildEv3 } from 'swimlib/ev3';

const { header, events, warnings } = parseEv3(content); // string | Uint8Array
const content2: string = buildEv3({ header, events }); // computes the check digit
```

- `parseEv3` reports a checksum mismatch as a warning (`checksum-mismatch`),
  not an error — files with hand-edited headers are still readable.
- `buildEv3` computes a fresh check digit by default;
  `buildEv3(data, { preserveCheckDigit: true })` writes `header.check_digit`
  verbatim (useful for byte-identical round-trips of existing files).
- The computed `*_cs` centisecond fields on events are output-only and never
  serialized.
- Qualifying-time fields normalized to `'0.00'` by the parser are written back
  as empty fields, matching Hy-Tek output.

## Header fields (35, in file order)

`meet_name`, `pool_name`, `meet_start_date`, `meet_end_date`, `age_up_date`,
`seeding_type`, `team_surcharge`, `athlete_surcharge`, `facility_surcharge`,
`file_format`, `meet_software`, `meet_sw_version`, `date_generated`,
`unknown1`, `sanction_number`, `altitude`, `valid_times_start_date`,
`minimum_age_open_events`, `max_total_entries`, `max_individual_entries`,
`max_relay_entries`, `id_format`, `class`, `entry_deadline`,
`pool_address1`, `pool_address2`, `pool_city`, `pool_province`,
`pool_postal_code`, `pool_country`, `host_LSC`, `exclude_notimes`,
`use_min_conforming_course_time_if_qt_non_conforming`, `entry_open_date`,
`check_digit`.

## Event fields (30, in file order)

`event_no`, `subevent_no`, `prelims_finals`, `rounds`, `ind_or_relay`,
`gender`, `min_age`, `max_age`, `distance`, `stroke`, `number_of_dives`,
`division_code`, `division_name`, `event_type`, `event_fee`,
`lcm_dqt`, `lcm_qt`, `scm_dqt`, `scm_qt`, `scy_dqt`, `scy_qt`,
`session_number`, `session_event`, `session_meet_day`, `session_start_time`,
`session_course`, `max_entries`, `max_individual_entries`,
`max_relay_entries`, `relay_team_members`.

## Times

Each qualifying (`qt`) / de-qualifying (`dqt`) time is exposed twice:

1. **String**: `"MM:SS.HH"` or `"SS.HH"` (e.g. `"1:23.45"`).
2. **Centiseconds** (`*_cs`): integer hundredths (e.g. `8345`).

Empty times normalize to `"0.00"` / `0` on parse. `SwimTime.fromCentiseconds`
in `swimlib/core` bridges the centisecond integers to the `SwimTime` class
used by the SDIF and HY3 modules.

## Check digit

The final header field is a 5-character check digit over the header line up
to — but not including — the final `;check_digit` separator. It is only
defined for lines of at least 128 characters (`buildEv3` throws
`Ev3BuildError` for shorter headers).

1. Sum the char codes of every character in the line.
2. Compute `trunc((sum - 4) / 9) + 52`, zero-padded to 4 digits.
3. The check digit is `digit[3] + digits[0..2] + line[2]`.

Some Hy-Tek exports terminate the stored digit with `*>`; the parser strips
that suffix before comparing. Exposed as `calculateEv3Checksum`.

## Code tables

| Table                  | Values                                                                                        |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| `Ev3StrokeCode`        | `A` Free, `B` Back, `C` Breast, `D` Fly, `E` IM, `F` Diving 1M, `G` Diving 3M, `H` Diving 10M |
| `Ev3CourseCode`        | `1` LCM, `2` SCM, `3` SCY (used by `session_course`)                                          |
| `Ev3EventCategory`     | `I` individual, `R` relay                                                                     |
| `Ev3PrelimsFinalsCode` | `F` finals only, `P` prelims+finals, `T` timed finals                                         |
| `Ev3SeedingType`       | `A` alpha, `C` circle, `O` composite, `E` event entry, `T` time                               |
| `Ev3MeetClass`         | `A` age group, `O` open, `H` high school, `C` college, `Y` YMCA, `M` masters, `D` disabled    |
| `Ev3IdFormat`          | `1` USA … `7` Canada, `8` US Masters                                                          |

Gender codes are normalized on parse: `M`/`B` → `M`, `F`/`W`/`G` → `F`.
`decodeStroke(stroke, indOrRelay?)` converts stroke codes to display names,
deriving relay names when the `'R'` flag is passed
(`decodeStroke('E', 'R')` → `'Medley Relay'`).
