# CI credential isolation

## Security boundary

Branch tests and PR helpers must not receive publishing, release-bot or cloud-deployment credentials. Removing a secret reference from YAML is not sufficient: a repository/organization secret can be referenced again by another branch. Privileged values must be stored only in branch-restricted GitHub environments, and their old repository/organization availability must be removed.

Do not merge this migration until the environment prerequisites and cutover checks below are complete. An environment declaration in YAML does not configure its protection. Do not let GitHub auto-create an unprotected environment.

## What remains in ordinary CI

The default workflow token is read-only for build/test jobs. PR-description and semantic-release-comment helpers use the short-lived GitHub token with only the permissions their metadata operations need; they do not receive the shared Adobe bot token.

CODECOV_TOKEN remains limited to coverage upload steps. Existing AI-review credentials/workflows are a separate scope and are not changed by this migration. This change removes **publishing/deployment authority**, not every credential used for observability or AI services.

## Cutover order

1. Create and restrict the environments described below. Use exact branch policies of type `branch`; do not permit arbitrary branches or tags. Set `can_admins_bypass: false` and consider an additional independent reviewer for production/maintenance.
2. Provision new environment-only credentials with the narrowest repository/service/account scope. GitHub cannot reveal existing secret values for copying. Use the GitHub secret UI or a secure secret-input tool; never paste tokens into issues, PRs or chat.
3. Verify the **environment secret metadata** contains all required names. Do not rely on a repository/organization fallback value.
4. Review and merge the mainline and maintained 1.x workflow changes. Coordinate the short transition with the release operator; do not enable an old branch's publishing workflow after removing its credentials.
5. Remove these repositories' access to shared organization `ADOBE_BOT_GITHUB_TOKEN` and `ADOBE_BOT_NPM_TOKEN` secrets, and delete any repository copies. Do not delete shared organization secrets globally. For all-repository organization secrets, an organization administrator must convert availability safely without disrupting other repositories.
6. Remove/revoke the old repository publishing/deployment token copies listed below. Deleting a GitHub secret does not revoke the credential at its issuer. Replace an old shared token if it remains capable of writing these repositories through another consumer.
7. Verify a harmless feature-branch run has no privileged secret access; attempts to enter protected environments are denied. Do not log values, token prefixes or derived hashes. Check presence only through boolean results and administrative metadata.
8. Run a controlled release/deployment from an allowed reviewed branch and verify normal bot bookkeeping and monitoring. Do not loosen protections or restore broad secrets to fix an incomplete migration.

The release token currently needs to act as `adobe-bot`, because branch protection permits that publisher's bookkeeping and release-branch writes. Prefer a narrowly scoped credential. If moving to a GitHub App, update the allowed publisher identity deliberately rather than adding broad bypass rights.

## Validation

Run `actionlint .github/workflows/*` and `git diff --check`. Review every `secrets.*` reference, the containing job's environment and its ref condition. Test jobs must not gain contents-write or publishing OIDC authority merely to run a release dry run.

## Browser-library environments

| Environment | Allowed branches | Secrets |
| --- | --- | --- |
| `release` | `main`, `1.x` | `RELEASE_GITHUB_TOKEN`; existing Slack notification secrets if used; `LEGACY_NPM_TOKEN` only for the legacy 1.x publisher |

Mainline npm publication uses trusted publishing/OIDC; it no longer references NPM_TOKEN. **Configure the npm trusted publisher to require the GitHub environment named `release`.** A workflow filename alone is not the intended branch boundary: branch-controlled workflows can request OIDC too.

The 1.x backport preserves its existing token-based npm publisher, but renames its secret to environment-only `LEGACY_NPM_TOKEN`. Do not weaken npm's authentication policy to accommodate an unsupported legacy workflow. If token publishing is prohibited, upgrade the 1.x publisher to OIDC or explicitly retire that release path before completing cutover.

Remove repository `NPM_TOKEN` / `ADOBE_BOT_NPM_TOKEN` copies and revoke obsolete tokens after replacing their legitimate uses. Slack secrets should also be environment-only if used only for release notifications.

The environment-only `RELEASE_GITHUB_TOKEN` intentionally has a new name so release jobs cannot silently fall back to the old shared organization bot secret.
