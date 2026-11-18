# CI and release authorization

## Selected authorization model

- npm publication uses OIDC through a trusted publisher requiring the GitHub `release` environment. Mainline and 1.x need no npm token.
- GitHub API calls (releases, comments) use the job's short-lived `github.token` / `GITHUB_TOKEN`. `release-*` pushes use a short-lived token from the private publisher App, minted inside the `release` environment. No `adobe-bot`, PAT or `RELEASE_GITHUB_TOKEN`.
- Build/test jobs default to read-only repository access. Only publishing jobs request the write permissions needed for tags, GitHub releases and release-branch updates. Metadata helpers retain their explicit, narrower permissions.
- Stored provider/notification credentials belong in the corresponding protected environment, never a shared publishing credential exposed to branch CI.

## Explicit publication pause

The repository variable `RELEASE_ENABLED` must compare equal to `true` for normal publication. It remains false during this migration. Unset/false skips publication while ordinary tests continue. Collector CI deployment and maintenance have independent `CI_DEPLOY_ENABLED` and `MAINTENANCE_ENABLED` switches.

These switches are operational controls, not authorization boundaries. Exact ref guards and environment branch policies remain required. Keep all switches false until the appropriate reviewed path has been validated.

## Source branches and generated metadata

Releases do not commit version/changelog changes back to `main` or `1.x`. The `@semantic-release/git` plugin is removed. npm's prepare step can update package metadata in the ephemeral release workspace, but no source-branch push is made.

Release-local notes are generated in `release-notes.md`, attached to the GitHub release, and included in the artifact branches where those are published. The generated file is cleared before each CI release. GitHub Releases/npm version metadata are authoritative; the source branch's historical `CHANGELOG.md` and package version are no longer automatically maintained by a publishing account.

No publisher gets a PR-review or force-push bypass on source branches. The old `adobe-bot` review allowances are removed. Repository review requirements remain enabled for administrators as well.

## Preserved AEM delivery path and release-branch writer

The tagger-backed 2.x publication path remains:

`release-* branches → AEM Code Sync → aem.live`

Only the private GitHub App **helix-rum-release-publisher** may create, update or force-update `release-*` branches. Deletion remains blocked, and the App has no bypass on `main` or `1.x`. It has repository contents read/write only, and is installed only on helix-rum-js and helix-rum-enhancer.

The release job and the canary mint a short-lived installation token with `actions/create-github-app-token` (pinned by commit SHA). They use the App client ID from the `release` environment variable `RELEASE_APP_CLIENT_ID` and the private key from the `release` environment secret `RELEASE_APP_PRIVATE_KEY`. The token is scoped to the current repository with `contents: write` and revoked when the job ends. Checkout persists it, so `tagger.sh` pushes release branches as the App. GitHub API calls (releases, issue and PR comments) still use the job's `GITHUB_TOKEN`.

Why not `GITHUB_TOKEN`: GitHub does not honor the GitHub Actions identity in branch push allowances or ruleset bypass lists. The first canary run failed with GH006 for this reason. Ordinary workflows with `contents: write` therefore cannot write `release-*`; only jobs that can read the `release` environment's key can, and that environment only admits `main` and `1.x`.

Pushes made with the App token trigger ordinary `push` workflows on the release branches (as the old bot pushes did); the release job itself only runs on `main`/`1.x`. AEM Code Sync is an external integration; check delivery with the canary workflow before relying on this path.

To rotate the key: generate a new private key in the App settings, pipe it into both repositories' `release` environment secret, then delete the old key in the App settings.

## Validation

`npm run test-release` loads the release configuration and resolves every plugin without publishing credentials. It also verifies there is no source-commit plugin or obsolete credentialed dry-run script. The tagger-backed packages additionally run local bare-Git tests for ref names, dirty/detached worktrees, missing/unsafe artifacts, atomic failure and stale leases.

Run the normal lint/browser/Node suites and `actionlint .github/workflows/*` as well. No validation command should reintroduce a publishing token into branch tests.

## Release environment

Allow only reviewed `main` and `1.x` refs. Keep the npm trusted publisher bound to environment `release` and keep bypass-2FA npm tokens disallowed. No npm secret is required. The only GitHub credential is the publisher App key described above. Existing Slack notification credentials, if used, are a separate environment-scoped integration.

### Tagger-backed publication

For the 2.x workflows, `tagger.sh` starts from the checked-out source commit and adds only explicitly listed generated files using an isolated Git index. It does not check out another branch, reset source history, borrow staged changes or modify the working tree.

- A stable version such as 2.3.4 updates `release-2-3-4`, `release-2-3-x` and `release-2-x` to one artifact commit.
- A prerelease updates only its normalized exact branch.
- With `--push`, remote refs are updated atomically using explicit per-ref leases. A rejected or concurrently changed ref fails the whole push; there is no partial/sequential fallback.
- Without `--push`, local refs are updated transactionally for inspection. Checked-out release refs are refused.
- Earlier exact versions are left alone by a newer release. This is not a write-once guarantee: deliberately republishing the same version can still rewrite its exact branch through the publisher App.
- Normal git/npm release tags remain semantic-release's responsibility. The tagger only publishes generated branches.

### Live authentication/Code Sync smoke test

After this workflow is merged to main, manually run **Verify release-branch delivery** (`verify-release-auth.yml`). It can run while normal publication is paused, from reviewed main in the release environment.

It writes a unique `release-0-0-0-auth-<run-id>` branch containing a harmless source/run marker, then verifies the bytes delivered by the corresponding `aem.live` URL with bounded retries. It does not publish npm packages, alter stable version aliases or enable any publication switch. It retains the canary branch; deleting it requires a deliberate maintainer action under the no-deletion policy.

This workflow exists on the tagger-backed 2.x mainline, not the historical 1.x package layout. The 1.x workflows retain their existing npm/GitHub release paths, now using OIDC and GITHUB_TOKEN without source commits.
