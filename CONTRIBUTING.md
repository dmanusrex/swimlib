# Contributing to SwimLib

## Setup

```sh
git clone https://github.com/dmanusrex/swimlib.git
cd swimlib
npm ci
```

Node ≥ 20 required. There are no runtime dependencies — keep it that way; new
runtime dependencies will not be accepted.

By participating, you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).
Report vulnerabilities according to [SECURITY.md](SECURITY.md), not through a
public issue.

## Development workflow

| Command              | What it does                                        |
| -------------------- | --------------------------------------------------- |
| `npm test`           | Run the Vitest suite once                           |
| `npm run test:watch` | Vitest in watch mode                                |
| `npm run typecheck`  | `tsc --noEmit` (strict, `noUncheckedIndexedAccess`) |
| `npm run lint`       | ESLint + Prettier check                             |
| `npm run format`     | Prettier write                                      |
| `npm run build`      | tsup → `dist/` (dual ESM + CJS + `.d.ts`)           |

All four of lint, typecheck, test, and build must be green before a PR —
CI runs them on every push/PR (tests on Node 20/22/24, plus `publint` and
`@arethetypeswrong/cli` against the packed tarball).

## Code conventions

- **No TypeScript `enum`s** (ESLint-enforced). Code tables are as-const
  objects with derived literal union types:
  ```ts
  export const Stroke = { FREESTYLE: '1', ... } as const;
  export type Stroke = (typeof Stroke)[keyof typeof Stroke];
  ```
- Every format module exposes synchronous `parseX` / `buildX` front doors and
  collects non-fatal issues in a `warnings` array rather than throwing.
- Errors extend `SwimLibParseError` / `SwimLibBuildError` from `src/core`.
- The library stays runtime-agnostic: no `fs`, `path`, `Buffer`, or other
  Node-only APIs in `src/` (tests may use them).
- Format modules are self-contained apart from `src/core` — no cross-imports
  between `src/sdif`, `src/hy3`, etc.

## Tests and fixtures

- Tests live in `tests/`, mirroring `src/`; fixtures in `tests/fixtures/`.
- Binary and fixed-width fixtures are protected by `.gitattributes`
  (`binary` / `-text`) — never let git normalize their line endings. Add
  matching attributes when introducing a new fixture extension.
- Never attach or commit files containing real swimmer or family information.
  Fixtures must be synthetic or fully anonymized, including names, birth dates,
  contact details, registration identifiers, and medical information.
- Byte-exact round-trip tests against real files are the gold standard for
  any parser/writer change. If you have real `.hy3`, `.sd3`, or `.cl2` files
  you can share (with personal data anonymized), they are very welcome — the
  HY3 checksum implementation is provisional until validated against real
  Hy-Tek output.

## Changesets

Every user-visible change needs a changeset:

```sh
npx changeset
```

Pick the bump level (patch/minor/major) and describe the change; commit the
generated file under `.changeset/` with your PR. Releases are cut
automatically from merged changesets — see [RELEASING.md](RELEASING.md).

## Format documentation

Byte-level format specs live in `docs/formats/`. If a code change alters a
layout, offset, or algorithm described there, update the doc in the same PR.
