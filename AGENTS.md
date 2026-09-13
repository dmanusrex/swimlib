# AGENTS.md

`swimlib` — zero-dependency TypeScript readers/writers for swimming data
formats (SDIF/SD3+CL2, HY3, EV3, REC, STD/ST2). Single npm package with
subpath exports. Detailed docs:

- [docs/architecture.md](docs/architecture.md) — module anatomy, patterns, invariants, project status
- [docs/formats/](docs/formats/) — byte-level format specs (one per format)
- [CONTRIBUTING.md](CONTRIBUTING.md) — workflow, conventions · [RELEASING.md](RELEASING.md) — Changesets flow

## Commands

```sh
npm test              # vitest run (all tests must pass)
npm run typecheck     # tsc --noEmit (strict + noUncheckedIndexedAccess)
npm run lint          # eslint + prettier --check
npm run format        # prettier --write
npm run build         # tsup → dist/ (dual ESM+CJS)
npx vitest run tests/<module>   # one module's tests
```

All of typecheck, test, lint must be green before committing.

## Layout

- `src/core/` — shared: errors, SwimTime, Windows-1252 codec, Hy-Tek float
  time codec, MMDDYY dates. `src/{rec,std,sdif,hy3,ev3}/` — one module per
  format, each exposing sync `parseX(input, options?)` / `buildX(data, options?)`.
- `tests/` mirrors `src/`; fixtures in `tests/fixtures/`.
- `old-libraries/` — **reference only** (pre-port source, excluded from
  build/lint/publish; deleted in a future phase). Never import from it.

## Hard rules

- **No TypeScript `enum`s** (ESLint-enforced): as-const objects + derived
  literal union types.
- **No runtime dependencies**, no Node-only APIs (`fs`, `Buffer`, …) in `src/`.
- Format modules import only from `src/core` and themselves — never each other.
- Parsers collect non-fatal issues in `warnings: SwimLibWarning[]`; errors
  extend `SwimLibParseError`/`SwimLibBuildError`.
- **Never let git normalize fixture line endings** — `.gitattributes` marks
  swim-format extensions `binary`/`-text`; add entries for new fixture types.
- Byte-identical round-trip guarantees (REC/STD always; EV3 for valid files)
  are contractual — fixture round-trip tests are the gold standard.
