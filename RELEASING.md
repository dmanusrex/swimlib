# Releasing SwimLib

Releases are fully automated with [Changesets](https://github.com/changesets/changesets)
via `.github/workflows/release.yml`. Day-to-day you never publish by hand.

## How it works

1. PRs that change behaviour include a changeset file (`npx changeset`).
2. On every push to `main`, the release workflow runs `changesets/action`:
   - If there are pending changesets, it opens (or updates) a **"Version
     Packages" PR** that bumps `package.json`, updates `CHANGELOG.md`, and
     deletes the consumed changesets.
   - When that PR is merged, the workflow builds and runs
     `changeset publish`, publishing to npm **with provenance** and creating
     a git tag + GitHub release.

## One-time setup (repository owner)

1. **Create the GitHub repository** `dmanusrex/swimlib` and push `main`:

   ```sh
   git remote add origin https://github.com/dmanusrex/swimlib.git
   git push -u origin main
   ```

2. **npm token**: on npmjs.com create a **granular access token** with
   _Read and write_ permission scoped to the `swimlib` package (after first
   publish) or to all packages (for the initial publish). Add it to the GitHub
   repo as an Actions secret named **`NPM_TOKEN`**
   (Settings → Secrets and variables → Actions → New repository secret).

3. **Allow the workflow to open PRs**: Settings → Actions → General →
   Workflow permissions → check **"Allow GitHub Actions to create and approve
   pull requests"** (the workflow already requests `contents: write`,
   `pull-requests: write`, and `id-token: write` for provenance).

4. npm provenance requires the package to be published from the public GitHub
   Actions runner (already configured via `publishConfig.provenance` in
   package.json). No further setup is needed for the initial token-based publish.

5. **Repository security and merge settings**: after the first CI run, protect
   `main` with a ruleset that requires pull requests and every CI job, blocks
   force pushes, and blocks branch deletion. Enable Dependabot alerts and
   security updates, secret scanning, push protection, and private vulnerability
   reporting.

## Cutting the first release (0.1.0)

A changeset for the initial minor release is already committed. Once the
one-time setup above is done and `main` is pushed:

1. The release workflow opens the "Version Packages" PR bumping to `0.1.0`.
2. Review the generated `CHANGELOG.md`, merge the PR.
3. The workflow publishes `swimlib@0.1.0` to npm.
4. Verify: `npm view swimlib` and, in a scratch directory,
   `npm install swimlib` then import a subpath from both ESM and CJS.

## After the first npm publish

Replace the long-lived npm token with npm trusted publishing:

1. In the npm package settings, add a GitHub Actions trusted publisher for
   `dmanusrex/swimlib` using workflow filename `release.yml`.
2. Update the release job to Node 22.14 or newer and npm 11.5.1 or newer.
3. Remove `NPM_TOKEN` and `NODE_AUTH_TOKEN` from the workflow and delete the
   repository secret after a trusted publish succeeds. Keep `id-token: write`.
4. In npm package settings, require two-factor authentication and disallow
   traditional publishing tokens.

Trusted publishing supplies short-lived OIDC credentials and automatically
generates provenance for a public package published from a public repository.

## Manual escape hatch

If CI is unavailable, a maintainer with npm publish rights can run:

```sh
npm run build
npx changeset version   # consume changesets, bump version, update changelog
git commit -am "Version packages"
npx changeset publish   # publishes + tags
git push --follow-tags
```
