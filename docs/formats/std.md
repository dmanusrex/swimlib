# Hy-Tek time standard files (`.STD` / `.ST2`) — `swimlib/std`

Binary layout for Hy-Tek Meet Manager time standard exports. Time words use
the same modified float encoding as `.REC` files — see
[`rec.md`](./rec.md#time-encoding-4-bytes-little-endian).

## API

```ts
import { parseStd, buildStd } from 'swimlib/std';

const { header, standards, warnings } = parseStd(bytes, 'st2'); // format required
const rebuilt: Uint8Array = buildStd(header, standards, 'st2');
```

| Export                                | Role                                                          |
| ------------------------------------- | ------------------------------------------------------------- |
| `parseStd(input, format)`             | **`format` required:** `'st2'` or `'std'`. No auto-detection. |
| `buildStd(header, standards, format)` | Returns exactly `standardBlockCount × blockSize` bytes.       |

(`parseStdFile` / `buildStdFile` remain as deprecated aliases.)

### Parse rules

1. Caller supplies `format` (block size 320 vs 260).
2. Read header frame; validate magic `STD`.
3. `standardBlockCount` in the header is **authoritative** — read that many frames from offset 0.
4. Bytes after `standardBlockCount × blockSize` (vendor trailing junk) are ignored
   with a `trailing-data-ignored` warning.
5. Error if `input.length` is less than the logical size (truncated).

## Block sizes

| Format | Block size | Labels | Active time entries per standard row                                |
| ------ | ---------- | ------ | ------------------------------------------------------------------- |
| ST2    | 320        | 12     | 72 (12 × 6 kinds)                                                   |
| STD    | 260        | 8      | 48 (8 × 6 kinds); 240-byte times region includes padded extra slots |

`standardBlockCount` includes the header frame (same convention as `.REC`
`recordCount`).

## Time kinds (per label column)

Order in file for each label index `L`:

1. SCM-DQT — SCM De-Qualifying Time (slower than / minimum time in Lenex)
2. LCM-DQT — LCM De-Qualifying Time (slower than / minimum time in Lenex)
3. SCY-DQT — SCY De-Qualifying Time (slower than / doesn't exist in Lenex)
4. SCM-QT — SCM Qualifying Time (faster than / maximum time in Lenex)
5. LCM-QT — LCM Qualifying Time (faster than / maximum time in Lenex)
6. SCY-QT — SCY Qualifying Time (faster than / doesn't exist in Lenex)

Byte offset within the times region (kind-major):
`(kindIndex * labelCount + L) * 4`.

## Header layout (ST2)

| Field         | Offset | Length  | Notes                              |
| ------------- | ------ | ------- | ---------------------------------- |
| Magic         | 0      | 3       | `STD`                              |
| Block count   | 3      | 4       | Numeric, zero-padded (e.g. `0011`) |
| Created date  | 7      | 6       | `MMDDYY`                           |
| Pad           | 13     | 7       | Spaces                             |
| Labels        | 20     | 48      | 12 × 4 chars, right-justified      |
| Year id + pad | 68     | 20 × 12 | Each: 4-char year + 16 spaces      |
| Trailing pad  | 308    | 12      | Spaces                             |

## Header layout (STD)

Same through labels (32 bytes, 8 labels), then an **8-byte pad** at offset 52,
then 8 year slots (20 bytes each) starting at offset 60, then a 40-byte
trailing pad (total 260).

## Standard row layout

| Field     | Offset | Length                | Notes                                                     |
| --------- | ------ | --------------------- | --------------------------------------------------------- |
| Gender    | 0      | 1                     | ASCII `1` = men/boys, `2` = women/girls                   |
| Stroke    | 1      | 1                     | ASCII `1`=Free, `2`=Back, `3`=Breast, `4`=Fly, `5`=Medley |
| Distance  | 2      | 4                     | Left-justified                                            |
| Lower age | 6      | 2                     | Right-justified; `"  "` = under                           |
| Upper age | 8      | 2                     | Right-justified; `"  "` = over                            |
| Type      | 10     | 1                     | `I` / `R`                                                 |
| Pad       | 11     | 9                     | Spaces                                                    |
| Times     | 20     | 288 (ST2) / 240 (STD) | Modified float LE                                         |
| Pad       | 308    | 12                    | ST2 only                                                  |

Unset time slots are stored as all-spaces or all-null bytes; both decode
to `0`. Building writes time bytes only when `seconds > 0`.

## Round-trip guarantee

Parsed standards keep `timesRegionRaw` (the full times bytes) and, for ST2,
`blockTrailingPad`; the header keeps `headerTrailingPad`. When present, these
raw regions are written back verbatim so a parse → build cycle is
byte-identical.

## Reference material

- `tests/fixtures/test_std.st2` — ST2 reference fixture
