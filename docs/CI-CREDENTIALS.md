# CI credential isolation

## Security boundary

Branch tests and PR helpers must not receive publishing, release-bot or cloud-deployment credentials. Removing a secret reference from YAML is not sufficient: a repository/organization secret can be referenced again by another branch. Privileged values must be stored only in branch-restricted GitHub environments, and their old repository/organization availability must be removed.

## Explicit publication pause

The maintainer approved a hard cutover with publication/deployment paused. These workflow changes are safe to merge after code review and CI while the publishing environments remain empty: the release jobs require the **repository variable** `RELEASE_ENABLED` to compare equal to `true` (GitHub string comparisons are case-insensitive). An unset variable, `false`, or an unrelated value skips publication before entering its environment or reading release credentials. Tests still run.

Collector CI deployment and cleanup have independent, default-off repository variables `CI_DEPLOY_ENABLED` and `MAINTENANCE_ENABLED`. These switches are operational controls, **not authorization boundaries**; exact ref checks and protected environments remain required. Do not use an environment variable for the job-level switch: environment variables are not available until the job starts.

Do not enable publication to clear a skipped check. Reactivation is separate work requiring a verified bot-free publishing path and the necessary narrowly scoped provider credentials. An environment declaration in YAML does not configure its protection; do not allow unprotected auto-created environments.

## What remains in ordinary CI

The default workflow token is read-only for build/test jobs. PR-description and semantic-release-comment helpers use the short-lived GitHub token with only the permissions their metadata operations need; they do not receive the shared Adobe bot token.

CODECOV_TOKEN remains limited to coverage upload steps. Existing AI-review credentials/workflows are a separate scope and are not changed by this migration. This change removes **publishing/deployment authority**, not every credential used for observability or AI services.

## Cutover order

1. Create and restrict the environments described below. Use exact branch policies of type `branch`; do not permit arbitrary branches or tags. Set `can_admins_bypass: false` and consider an additional independent reviewer for production/maintenance.
2. Keep the publication switches false while merging this CI hardening. Before later reactivation, provision only the narrowly scoped provider credentials still needed by the bot-free design, using protected environments. Never paste tokens into issues, PRs or chat.
3. Environment secret population is not a prerequisite for merging the explicitly paused workflows. Before reactivation, verify the provider credential metadata and never rely on repository/organization fallback copies.
4. Review and merge the mainline and maintained 1.x workflow changes. Coordinate the short transition with the release operator; do not enable an old branch's publishing workflow after removing its credentials.
5. Remove these repositories' access to shared organization `ADOBE_BOT_GITHUB_TOKEN` and `ADOBE_BOT_NPM_TOKEN` secrets, and delete any repository copies. Do not delete shared organization secrets globally. For all-repository organization secrets, an organization administrator must convert availability safely without disrupting other repositories.
6. Remove/revoke the old repository publishing/deployment token copies listed below. Deleting a GitHub secret does not revoke the credential at its issuer. Replace an old shared token if it remains capable of writing these repositories through another consumer.
7. Verify a harmless feature-branch run has no privileged secret access; attempts to enter protected environments are denied. Do not log values, token prefixes or derived hashes. Check presence only through boolean results and administrative metadata.
8. Run a controlled release/deployment from an allowed reviewed branch and verify normal bot bookkeeping and monitoring. Do not loosen protections or restore broad secrets to fix an incomplete migration.

## Bot-free follow-up

Do not provision a new `adobe-bot` credential or a replacement shared PAT. The intended follow-up uses npm OIDC and the built-in, short-lived `GITHUB_TOKEN` where repository operations require it.

The current release-job bodies are disabled transitional code and still reference `RELEASE_GITHUB_TOKEN`. Remove that lookup as part of the bot-free follow-up before enabling them; do not populate it to work around the pause. The existing semantic-release Git plugin writes protected source branches, and the 2.x tagger writes protected release branches. Those operations must be redesigned or removed before the built-in token can replace the old publisher safely. **Do not give the generic GitHub Actions identity a review/force-push bypass**: branch-controlled workflows could request a write-capable token too.

No bot-free reactivation or successful end-to-end release is claimed by this paused migration.

## Validation

Run `actionlint .github/workflows/*` and `git diff --check`. Review every `secrets.*` reference, the containing job's environment and its ref condition. Test jobs must not gain contents-write or publishing OIDC authority merely to run a release dry run.

## Browser-library environments

| Environment | Allowed branches | Secrets |
| --- | --- | --- |
| `release` | `main`, `1.x` | None required for this paused migration. Future publication uses OIDC; do not provision a bot/npm token. |

Mainline and 1.x npm publication use trusted publishing/OIDC; neither needs an npm token. **Configure the npm trusted publisher to require the GitHub environment named `release`.** A workflow filename alone is not the intended branch boundary: branch-controlled workflows can request OIDC too.

The 1.x backports grant OIDC only to the protected release job and use an OIDC-capable publisher on Node.js 24. Keep npm's existing requirement for 2FA with bypass-2FA tokens disallowed. Do not provision a legacy npm token or weaken that policy to accommodate old automation.

Remove repository `NPM_TOKEN` / `ADOBE_BOT_NPM_TOKEN` copies and revoke obsolete tokens after replacing their legitimate uses. Slack secrets should also be environment-only if used only for release notifications.

The disabled release-job body cannot fall back to the removed shared organization bot secret. Its transitional token reference must be removed in the bot-free follow-up, not re-provisioned.
