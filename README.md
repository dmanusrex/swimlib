# SwimLib

Read and write common swimming data formats in TypeScript — **zero runtime
dependencies**, works in Node (≥ 20) and the browser.

| Format     | Subpath        | Read | Write | Description                                                                       |
| ---------- | -------------- | ---- | ----- | --------------------------------------------------------------------------------- |
| SDIF (SD3) | `swimlib/sdif` | ✅   | ✅    | USA Swimming Standard Data Interchange Format                                     |
| CL2        | `swimlib/sdif` | ✅   | —     | Hy-Tek CommLink format (read via relaxed SD3 validation, checksums not validated) |
| HY3        | `swimlib/hy3`  | ✅   | ✅    | Hy-Tek entry, result and data interchange format                                  |
| EV3        | `swimlib/ev3`  | ✅   | ✅    | Hy-Tek meet event files                                                           |
| REC        | `swimlib/rec`  | ✅   | ✅    | Hy-Tek record files                                                               |
| STD / ST2  | `swimlib/std`  | ✅   | ✅    | Hy-Tek time standard files                                                        |

Full byte-level format documentation lives in [`docs/formats/`](docs/formats/).

## Install

```sh
npm install swimlib
```

Ships dual ESM + CJS with full type declarations. Import everything from the
root, or (recommended, for smaller bundles) from the per-format subpaths.

## Conventions

Every format module follows the same shape:

- **`parseX(input, options?)`** — synchronous. Text formats (SDIF, HY3, EV3)
  accept `string | Uint8Array` (bytes are decoded as Windows-1252, Hy-Tek's
  native encoding); binary formats (REC, STD) accept
  `Uint8Array | ArrayBuffer`.
- **`buildX(data, options?)`** — synchronous. Text formats return `string`
  (use `encodeWindows1252` from `swimlib/core` for on-disk bytes); binary
  formats return `Uint8Array`.
- Parse results carry a **`warnings`** array (`{ code, message, line? }`) for
  non-fatal issues — checksum mismatches, unknown record types, trailing
  data — so imperfect real-world files still load.
- All errors extend **`SwimLibError`** (→ `SwimLibParseError` /
  `SwimLibBuildError`), so one `catch (e instanceof SwimLibError)` covers
  every format.

## Quick starts

### SDIF (SD3) and CL2

```ts
import { readFile } from 'node:fs/promises';
import { parseSdif, parseCl2, buildSdif } from 'swimlib/sdif';

const meet = parseSdif(await readFile('results.sd3', 'utf8'));
console.log(meet.byType.meets[0]?.meetName);
for (const swim of meet.byType.individualEvents) {
  if (swim.finalsTime && !swim.finalsTime.isCode()) {
    console.log(swim.name, swim.finalsTime.format());
  }
}

const cl2 = parseCl2(await readFile('meet.cl2', 'utf8')); // relaxed mandatory fields
const sd3 = buildSdif(meet); // validates records, auto-appends Z0 terminator
```

### HY3 (meet entries example)

```ts
import { parseHy3, buildHy3 } from 'swimlib/hy3';

const entries = parseHy3(await readFile('entries.hy3', 'utf8')); // checksums verified
console.log(entries.byType.individualEvents.length, 'individual entries');

const out = buildHy3(entries.records);
```

### EV3 (meet events)

```ts
import { parseEv3, buildEv3 } from 'swimlib/ev3';

const { header, events } = parseEv3(await readFile('meet.ev3', 'utf8'));
console.log(header.meet_name);
const scmQualifiers = events.filter((e) => e.scm_qt_cs > 0);

const out = buildEv3({ header, events }); // computes the header check digit
```

### REC (records) and STD/ST2 (time standards)

```ts
import { parseRec, buildRec } from 'swimlib/rec';
import { parseStd, buildStd } from 'swimlib/std';

const rec = parseRec(await readFile('NAT_CAN-L.rec'));
console.log(rec.header.setName, rec.records.length, 'records');
const bytes = buildRec(rec.header, rec.records); // byte-identical round-trip

const std = parseStd(await readFile('standards.st2'), 'st2'); // format required
const st2 = buildStd(std.header, std.standards, 'st2');
```

### Shared core

```ts
import { SwimTime, decodeWindows1252, encodeWindows1252 } from 'swimlib/core';

SwimTime.fromString('1:05.32').getHundredths(); // 6532
SwimTime.fromString('NT').isCode(); // true
SwimTime.fromCentiseconds(6532).format(); // ' 1:05.32'
```

## Round-trip guarantees

- **REC, STD/ST2**: byte-identical — parsed records retain raw byte regions
  (time words, padding) and write them back verbatim.
- **EV3**: byte-identical for files with valid check digits
  (`{ preserveCheckDigit: true }` reproduces files with invalid stored digits).
- **SDIF, HY3**: byte-identical for files this library produced; semantically
  identical (spec-normalized padding) for arbitrary third-party files.

## Status

Pre-release. This is an amalgamation of my existing library and information from other sources.

There are some known data gaps:

### EV3 Data Gap

The 14th field in the header is unknown. It is always 3 in any file I generate.

### HY3 Data Gaps

- A1 File Codes are incomplete although all the common ones are defined
- Missing Record Types C4, C5 and C7. C7 is the qualifications record but 4 & 5 are unknown
- B3 is apparently a meet contact record - no known format - possibly deprecated? I don't see any fields in either the TM8 or MM8 database that would indicate this record is in use

## Acknowledgements

This would not have been possible without many reference sources both public and private.

See [PROVENANCE.md](PROVENANCE.md) for the role, license, and audited revision
of each public implementation.

- [SDIF Python Library by Tim Smith](https://github.com/tdsmith/sdif)
- [Hyparse Python Library by Jim Golliher](https://github.com/jgolliher/hyparse)
- [Hytek-Parse Python Library by Nino Maruszewski](https://github.com/SwimComm/hytek-parser/tree/master)
- [Google Groups SDIF Forum](https://groups.google.com/g/sdif-forum)
- [SwimTeam WordPress plugin by Mike Walsh](https://github.com/wp-plugins/wp-swimteam/tree/master)
- Plus a number of private contributions and my own research

## Contributing & releasing

See [CONTRIBUTING.md](CONTRIBUTING.md) and the
[Code of Conduct](CODE_OF_CONDUCT.md). Report vulnerabilities according to
[SECURITY.md](SECURITY.md), without including personal swimmer data. Releases
are automated with [Changesets](https://github.com/changesets/changesets) — see
[RELEASING.md](RELEASING.md).

## License

[MIT](LICENSE)
