# Release manifest and write-once releases

## Manifest

Every release publishes `release-manifest.json`:

```json
{
  "schema": 1,
  "package": "@adobe/helix-rum-js",
  "version": "X.Y.Z",
  "source": { "commit": "<git sha of main>" },
  "files": {
    "dist/<file>.js": { "integrity": "sha384-<base64>", "size": 1234 }
  }
}
```

- `files` lists **every `.js` file the build writes under `dist/`**, derived from the build output rather than a hand-maintained list. `integrity` uses the same format as Subresource Integrity, so it can be used directly in an `integrity` attribute.
- It's generated in `prepack`, right after the build that npm publishes, by `node release-manifest.mjs write`.
- It's attached to the GitHub release. **GitHub release immutability is enabled** for this repository, so that copy can't be changed after publication: it is the approved reference for monitors and the collector.
- It's also included in the `release-*` artifact branches (served via aem.live) and in the npm tarball.

`tagger.sh --manifest release-manifest.json` verifies, before changing any ref, that the manifest matches this version, that every built file is listed, and that every listed file's digest matches the bytes on disk. It then publishes exactly those files plus the manifest.

To check a served file by hand, compare the **decoded** bytes; aem.live always sends gzip:

```sh
curl -s --compressed https://release-X-Y-Z--helix-rum-js--adobe.aem.live/<path> | openssl dgst -sha384 -binary | base64
```

## Write-once exact releases

A repository ruleset, **Write-once exact release branches**, covers `refs/heads/release-[0-9]*-[0-9]*-[0-9]*`, which is every exact version and prerelease branch. It blocks updates, force pushes and deletion, with **no bypass actors**, administrators included. Creating a new exact branch is still allowed for the publisher App, through the classic `release-*` protection. Alias branches such as `release-2-x` and `release-2-17-x` aren't matched and keep moving to the newest release.

`tagger.sh` also refuses to publish when the exact branch already exists. semantic-release runs `tagger.sh <version> --check` in its **verifyRelease** step, before npm or GitHub publish anything, so an existing exact branch stops the whole release instead of failing after npm has already published.

Branch names replace every non-alphanumeric character with `-`, so `tagger.sh` only accepts versions for which that is reversible: no build metadata (`+...`) and no `-` inside prerelease identifiers (`2.4.0-rc.1` is fine, `2.4.0-rc-1` is rejected). Every version published so far meets this.
