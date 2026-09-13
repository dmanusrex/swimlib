# Hy-Tek `.REC` record files — `swimlib/rec`

This document defines the **binary** layout of Hy-Tek Meet Manager `.REC`
record files and the behaviour of the `swimlib/rec` module. It is the
human-readable companion to `src/rec/layout.ts`, `src/rec/parse.ts`, and
`src/rec/build.ts`; time words are handled by the shared codec in
`src/core/hytek-timecodec.ts`.

## Purpose and scope

The module implements a **source-agnostic** reader and writer: bytes in,
structured header + data records out, and the inverse.

**In scope:** 120-byte record framing, header and data field placement,
modified-float time encoding, `MMDDYY` dates, individual vs relay holder
layouts, Windows-1252 text serialization rules, and byte-identical round-trip
when `rawTimeBytes` is preserved from a parse.

**Out of scope:** Semantic interpretation of the 6-byte `event_code` beyond
storing six ASCII characters; mapping club codes to names; validating a
`.REC` against an external canonical record list.

All text fields are decoded/encoded as **Windows-1252**.

## API

```ts
import { parseRec, buildRec } from 'swimlib/rec';

const { header, records, warnings } = parseRec(bytes); // Uint8Array | ArrayBuffer
const rebuilt: Uint8Array = buildRec(header, records); // byte-identical after a parse
```

## High-level structure

A `.REC` file is a flat concatenation of **120-byte records**. There are no
line terminators, no checksums, and no length prefixes.

- The **first 120 bytes** are a single header record.
- Every subsequent 120-byte block is a data record (individual or relay).
- The total file size is always a multiple of 120.

The regression fixture `tests/fixtures/synthetic.rec.b64` is a base64-encoded,
fully synthetic file containing **1 header + 2 data records** =
**3 × 120 = 360** bytes. The header's record-count field is **3** (the count
**includes** the header). Keeping the fixture synthetic avoids redistributing
athlete data while retaining both individual and relay coverage.

## Header record (120 bytes)

| Offset | Length | Field              | Notes                                                          |
| -----: | -----: | ------------------ | -------------------------------------------------------------- |
|      0 |      3 | magic              | Always ASCII `REC`.                                            |
|      3 |      1 | space              | ASCII space (0x20).                                            |
|      4 |      3 | record count       | Right-aligned ASCII integer, **includes** the header.          |
|      7 |      6 | generation date    | `MMDDYY` (e.g. `091923` = 19 Sep 2023).                        |
|     13 |      1 | space              | ASCII space.                                                   |
|     14 |      1 | course code        | `L` = LCM, `S` = SCM, `Y` = SCY.                               |
|     15 |      4 | season tag         | 4-char season code (sample: `2020`).                           |
|     19 |     18 | record set name    | Space-padded Windows-1252 text (sample: `Canadian Age Group`). |
|     37 |     13 | software signature | Space-padded ASCII (sample: `WIN-TM028.0Fd`).                  |
|     50 |     70 | trailing pad       | All ASCII spaces (0x20).                                       |

When **building** a new file, if `setName` is empty the implementation sets it
from `courseCode`: `Rec_LC` / `Rec_SC` / `Rec_SCY` for `L` / `S` / `Y`,
matching Meet Manager's defaults.

## Data record (120 bytes)

Individual and relay rows share the same outer frame.

| Offset | Length | Field          | Notes                                                          |
| -----: | -----: | -------------- | -------------------------------------------------------------- |
|      0 |      6 | event code     | Six ASCII chars, left-aligned, space-padded (see Event codes). |
|      6 |      4 | age band       | `1112`, `1314`, `1517`, or four spaces for **Senior/Open**.    |
|     10 |      1 | type flag      | `I` = individual, `R` = relay.                                 |
|     11 |     80 | record holder  | See Holder field below.                                        |
|     91 |      6 | record date    | `MMDDYY`.                                                      |
|     97 |      4 | time bytes     | Hy-Tek modified float, little-endian. See Time encoding.       |
|    101 |      2 | lsc code       | The LSC (Province) code. Default is blanks.                    |
|    103 |      5 | club code      | Five ASCII Hy-Tek club characters (space-padded).              |
|    108 |      1 | time type      | `A` = actual, `R` = relay lead off, `S` = split.               |
|    109 |      2 | record century | Two ASCII chars (`20` years ≥ 2000, `19` years < 2000).        |
|    111 |      9 | trailing pad   | Nine ASCII spaces in known-good files; preserved as bytes.     |

### Holder field (offsets 11–90 within the 120-byte frame, 80 bytes)

**Individual (`I`):**

| Sub-offset | Length | Field            | Notes                          |
| ---------: | -----: | ---------------- | ------------------------------ |
|          0 |     30 | swimmer name     | `First Last` style text.       |
|         30 |     16 | team affiliation | Often empty.                   |
|         46 |     34 | tail padding     | Bytes preserved on round-trip. |

**Relay (`R`):**

| Sub-offset | Length | Field       | Notes                             |
| ---------: | -----: | ----------- | --------------------------------- |
|          0 |     30 | team label  | Club display text.                |
|         30 |     50 | relay names | `F. Last, F. Last, …` style text. |

In addition to typed holder fields, parsed records expose `holderRaw` as the
full 80-character holder region (offsets 11..90) for higher-layer
interpretations. During build, providing `holderRaw` writes that 80-char value
verbatim.

## Event codes

Stored as six bytes: gender, stroke, then distance digits. The **library does
not validate** stroke/distance combinations; it only reads and writes the
six-character field.

| Code     | Typical meaning                           |
| -------- | ----------------------------------------- |
| `1150  ` | Men 50m freestyle (individual)            |
| `11100 ` | Men 100m freestyle (individual)           |
| `111500` | Men 1500m freestyle (individual)          |
| `14100 ` | Men 100m butterfly (individual)           |
| `25200 ` | Women 200m IM (individual)                |
| `15400 ` | Men 4×100m medley relay (400m total)      |
| `21800 ` | Women 4×200m freestyle relay (800m total) |

- Position 0: `1` = men/boys, `2` = women/girls.
- Position 1: stroke / relay family (`1` = free, `2` back, …, `5` IM or medley relay).
- Positions 2–5: total distance in meters (`50`, `100`, …).

## Age bands

| Field       | Meaning                                |
| ----------- | -------------------------------------- |
| `1112`      | 11–12 years                            |
| `1314`      | 13–14 years                            |
| `1517`      | 15–17 years                            |
| `  10`      | 10 & under                             |
| `17  `      | 17 & over                              |
| four spaces | **Senior / Open** (no age restriction) |

`ageBand` is serialized as a raw 4-character ASCII field; the library
preserves non-standard age encodings verbatim (including leading/trailing
spaces) rather than normalizing to a fixed set.

## Date encoding (`MMDDYY`)

ASCII digits.

- Header generation date uses `MMDDYY` and resolves `YY` into the **current
  century** (`currentCentury * 100 + YY`).
- Data record date (offset 91) pairs with record century (offset 109):
  `fullYear = Number(recordCentury) * 100 + Number(YY)`.
  No 70-year pivot is applied for data-record dates.

## Time encoding (4 bytes, little-endian)

The four bytes at offset 97 are **not** a raw IEEE-754 `float32`. They use a
Hy-Tek **modified** single-precision layout (shared with `.STD`/`.ST2` files):
the sign bit is unused (times are non-negative), and the biased exponent is
stored in the **high byte** with an offset of **+2** relative to IEEE-754.

**Bit layout of the 32-bit little-endian word `h`:**

- Bits 31–24: `(original_float_biased_exponent + 2) & 0xFF`
- Bit 23: zero in the encoded form
- Bits 22–0: IEEE-754 significand (fraction) bits of the original float

**Decode** (given four bytes, little-endian `h`):

1. Read `h` as `uint32` LE.
2. `modExp = (h >>> 24) & 0xFF`, `significand = h & 0x7FFFFF`.
3. `realExp = (modExp - 2) & 0xFF`.
4. `ieeeBits = (realExp << 23) | significand` (32-bit LE).
5. Reinterpret `ieeeBits` as IEEE-754 `float32` LE → seconds.

**Encode** (given non-negative seconds as `float32`):

1. Let `ieee` be the `uint32` LE bit pattern of `float32(seconds)`.
2. `biasedExp = (ieee >>> 23) & 0xFF`, `significand = ieee & 0x7FFFFF`.
3. `h = (((biasedExp + 2) & 0xFF) << 24) | significand`.
4. Write `h` as `uint32` LE (four bytes).

Exposed as `decodeHytekTime` / `encodeHytekTime` from `swimlib/core`
(re-exported from `swimlib/rec` as `decodeTime` / `encodeTime` for continuity).

Worked examples for the modified-float encoding:

| Hex (LE)      | Seconds | Display    |
| ------------- | ------: | ---------- |
| `66 66 3C 85` |   23.55 | `23.55`    |
| `3D 0A 5B 86` |   54.76 | `54.76`    |
| `A4 70 74 86` |   61.11 | `1:01.11`  |
| `E1 BA 05 88` |  133.73 | `2:13.73`  |
| `71 0D 6F 8A` |  956.21 | `15:56.21` |

## Round-trip guarantee

Each parsed **data** record exposes:

- `seconds`: number — decoded from the four time bytes.
- `rawTimeBytes`: `Uint8Array` of length **4**, a **copy** of the on-disk time
  field, when produced by `parseRec`.

When **building**:

- If `rawTimeBytes` is set, those four bytes are written **verbatim**
  (byte-identical round-trip for the whole file after `parseRec` → `buildRec`).
- If `rawTimeBytes` is omitted, the four bytes are **re-encoded** from
  `seconds` via the modified-float scheme above.

Other fixed-width regions (holder tail, trailing padding) are also preserved
from parse and written back unchanged so that known fixtures round-trip
without loss.
