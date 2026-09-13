# Releasing SwimLib

SwimLib uses Changesets for versioning, npm Trusted Publishing for
authentication and provenance, and npm staged publishing for a human approval
gate. Releases are never published directly from a version PR merge.

## Release flow

1. Pull requests that change package behaviour include a changeset
   (`npx changeset`).
2. On pushes to `main`, `.github/workflows/release.yml` runs
   `changesets/action` and opens or updates the **Version Packages** PR.
3. Merging the Version Packages PR changes the version and changelog. The
   workflow detects that version change and runs `npm stage publish` using npm
   Trusted Publishing.
4. A maintainer reviews the package in npm's **Staged Packages** tab and
   approves it with two-factor authentication.
5. After approval, run the **Release** workflow manually in GitHub Actions and
   enter the approved version (for example, `0.2.0`). The workflow verifies the
   live npm version, creates its `v<version>` Git tag, and creates the GitHub
   release.

If a push does not change the package version, the workflow does not attempt to
stage anything. This keeps documentation and dependency-only merges from
creating duplicate npm stages.

## Trusted Publishing configuration

The npm package must have a GitHub Actions trusted publisher with:

- Owner: `dmanusrex`
- Repository: `swimlib`
- Workflow filename: `release.yml`
- Permission: allow staged publishing
- Environment: unset, unless the workflow is updated to use the same named
  GitHub environment

The workflow uses a GitHub-hosted runner, Node 24, npm 11.19.1, and
`id-token: write`, satisfying npm's OIDC and staged-publishing requirements. It
does not use `NPM_TOKEN` or `NODE_AUTH_TOKEN`. Remove the old `NPM_TOKEN`
repository secret after the first trusted staged publish succeeds.

## Approving a stage

The recommended path is npmjs.com → **Staged Packages** → review → **Approve**.
Approval requires two-factor authentication. The equivalent CLI flow is:

```sh
npm stage list
npm stage view <stage-id>
npm stage download <stage-id>
npm stage approve <stage-id>
```

Do not run the workflow's manual finalization step before approval; it verifies
that `swimlib@<version>` is live and fails without creating a tag if approval is
still pending.

## Manual recovery

If staging automation is unavailable, check out the version commit and run:

```sh
npm ci
npm run check
npm run release
```

After approving the resulting npm stage, run the **Release** workflow manually
to create the matching Git tag and GitHub release.
