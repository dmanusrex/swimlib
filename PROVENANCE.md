# Provenance

SwimLib is an independent TypeScript implementation of swimming-data
interchange formats. Public projects and documents were used to learn format
facts, compare observable behavior, and test interoperability. Their source
code is not incorporated into this repository.

## SDIF

- The official _Standard Data Interchange Format, Version 3.0_, dated
  April 28, 1998, is retained in PDF and plain-text form under `docs/formats/`.
  The text copy exists to make the fixed-width specification searchable and
  accessible to development tools; it does not change the specification.
- [tdsmith/sdif](https://github.com/tdsmith/sdif) was used as an additional
  behavioral reference. It is distributed under Apache-2.0. Audit reference:
  commit `39bb40ddc72f08dc36f04231a9604dc85fcccbed`.

## HY3

HY3 field positions and checksum behavior were reconstructed from Team Manager
8 exports and cross-checked against these public references:

- [SDIF Forum HY3 discussion](https://groups.google.com/g/sdif-forum/c/jGi-watQucs)
- [wp-swimteam](https://github.com/wp-plugins/wp-swimteam), declared GPL;
  audit reference `3652df6c40d493cebb3e19f414edb0898d636bd5`
- [jgolliher/hyparse](https://github.com/jgolliher/hyparse), with no repository
  license visible at audit reference
  `e95bcc815192af3d332e461129f1f3b4515d9711`
- [SwimComm/hytek-parser](https://github.com/SwimComm/hytek-parser), MIT;
  audit reference `c5ffe170f3845ebc2b8b1778f78f44b2e34722a8`

The HY3 documentation and TypeScript implementation use independently written
descriptions and code. Values such as field widths, offsets, record identifiers,
and checksum arithmetic are interoperability facts.

## Fixtures

Committed fixtures use synthetic names and data. The REC regression fixture is
stored as `tests/fixtures/synthetic.rec.b64`; decoding it yields three 120-byte
frames covering the header, individual, and relay layouts. Unsanitized local
Hy-Tek exports are excluded by `.gitignore` and must not be committed.

## Private input

Private observations and sample files were used only to validate behavior and
resolve discrepancies between public descriptions. Contributors are expected
to submit only material they have the right to share under the repository's
MIT license.
