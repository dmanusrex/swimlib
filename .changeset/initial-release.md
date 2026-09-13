---
'swimlib': minor
---

Initial release of SwimLib — TypeScript readers and writers for common
swimming data formats with zero runtime dependencies:

- `swimlib/sdif` — SDIF (SD3) read/write with validation; Hy-Tek CL2 read via
  `parseCl2` (mandatory-field checks turned off)
- `swimlib/hy3` — Hy-Tek HY3 meet entries and results read/write with
  line-checksum computation and verification
- `swimlib/ev3` — Hy-Tek EV3 meet event files read/write, including header
  check-digit computation
- `swimlib/rec` — Hy-Tek REC record files read/write with byte-identical
  round-trip
- `swimlib/std` — Hy-Tek STD/ST2 time standard files read/write with
  byte-identical round-trip
- `swimlib/core` — shared primitives: `SwimTime`, Windows-1252 codec, Hy-Tek
  float time codec, MMDDYY date helpers, `SwimLibError` hierarchy
