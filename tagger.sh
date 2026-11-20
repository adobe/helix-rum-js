#!/usr/bin/env bash
# Publish generated release branches without committing to or checking out source branches.
set -euo pipefail

fail() {
  printf 'tagger: %s\n' "$*" >&2
  exit 1
}

if (( $# < 2 )); then
  fail 'Usage: tagger.sh <version> --check | <version> [--manifest release-manifest.json] [files...] [--push]'
fi
VERSION=$1
shift
# Branch names replace every non-alphanumeric character with '-'. Allow only versions for
# which that is reversible: no build metadata ('+') and no '-' inside prerelease
# identifiers, so 2.4.0-rc.1 and 2.4.0-rc-1 cannot both claim release-2-4-0-rc-1.
[[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z]+(\.[0-9A-Za-z]+)*)?$ ]] \
  || fail "Unsupported version (semver without build metadata or '-' inside prerelease identifiers): $VERSION"

PUSH=false
CHECK=false
MANIFEST=''
FILES=()
while (( $# )); do
  case "$1" in
    --push) PUSH=true ;;
    --check) CHECK=true ;;
    --manifest)
      (( $# > 1 )) || fail '--manifest requires a path'
      MANIFEST=$2
      shift
      ;;
    --*) fail "Unknown option: $1" ;;
    *) FILES+=("$1") ;;
  esac
  shift
done

NORMALIZED_VERSION=${VERSION//[^[:alnum:]]/-}
BRANCHES=("release-$NORMALIZED_VERSION")
if [[ "$VERSION" =~ ^([0-9]+)\.([0-9]+)\.([0-9]+)$ ]]; then
  # The exact branch already is the patch branch: create it only once.
  BRANCHES+=("release-${BASH_REMATCH[1]}-${BASH_REMATCH[2]}-x" "release-${BASH_REMATCH[1]}-x")
fi
REFS=()
for branch in "${BRANCHES[@]}"; do
  git check-ref-format "refs/heads/$branch"
  REFS+=("refs/heads/$branch")
done
# Exact-version branches are write-once (also enforced by a repository ruleset).
# Aliases such as release-2-x move to the newest release.
EXACT_REF=${REFS[0]}

if [[ "$CHECK" == true ]]; then
  # Pre-publish check (semantic-release verifyRelease, before npm and GitHub publish):
  # fail early if this version's exact branch already exists on the remote.
  (( ${#FILES[@]} == 0 )) && [[ "$PUSH" == false && -z "$MANIFEST" ]] \
    || fail '--check takes no files, --manifest or --push'
  set +e
  git ls-remote --exit-code --heads origin "$EXACT_REF" > /dev/null
  status=$?
  set -e
  case "$status" in
    0) fail "Exact release branch already exists and is write-once: $EXACT_REF" ;;
    2) printf 'Release %s can be published: %s is available\n' "$VERSION" "$EXACT_REF"; exit 0 ;;
    *) fail "Cannot check $EXACT_REF on origin (git ls-remote exit $status)" ;;
  esac
fi

if [[ -n "$MANIFEST" ]]; then
  # The manifest lists every built executable file. Verify it against the files on disk
  # and this version, then publish exactly those files plus the manifest itself.
  MANIFEST_TOOL="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/release-manifest.mjs"
  node "$MANIFEST_TOOL" verify "$MANIFEST" "$VERSION" || fail "Release manifest verification failed: $MANIFEST"
  MANIFEST_FILES=$(node "$MANIFEST_TOOL" files "$MANIFEST") || fail "Cannot read $MANIFEST"
  while IFS= read -r file; do
    if [[ -n "$file" ]]; then
      FILES+=("$file")
    fi
  done <<< "$MANIFEST_FILES"
  FILES+=("$MANIFEST")
fi
(( ${#FILES[@]} > 0 )) || fail 'At least one release file is required'

ROOT=$(git rev-parse --show-toplevel)
[[ "$PWD" -ef "$ROOT" ]] || fail 'Run from the repository root; files must be repository-relative'
SOURCE_COMMIT=$(git rev-parse 'HEAD^{commit}')

# Validate every input before changing any ref. Do not follow artifact symlinks.
for file in "${FILES[@]}"; do
  case "$file" in
    /*|..|../*|*/../*|*/..|.git|.git/*) fail "Unsafe release path: $file" ;;
  esac
  [[ -f "$file" && ! -L "$file" ]] || fail "Missing or non-regular release file: $file"
  parent=$(dirname "$file")
  while [[ "$parent" != '.' ]]; do
    [[ ! -L "$parent" ]] || fail "Symlinked release directory: $parent"
    parent=$(dirname "$parent")
  done
done


if [[ "$PUSH" == false ]]; then
  if git show-ref --verify --quiet "$EXACT_REF"; then
    fail "Exact release branch already exists and is write-once: $EXACT_REF"
  fi
  # update-ref must not move a branch checked out in this or another worktree.
  WORKTREES=$(git worktree list --porcelain)
  for ref in "${REFS[@]}"; do
    if grep -Fxq "branch $ref" <<< "$WORKTREES"; then
      fail "Refusing to update a checked-out release branch: $ref"
    fi
  done
fi

TEMP_DIR=$(mktemp -d "${TMPDIR:-/tmp}/rum-release.XXXXXX")
trap 'rm -rf "$TEMP_DIR"' EXIT

# semantic-release may have changed package.json/CHANGELOG.md in the working tree.
# Include only explicitly selected files; never borrow the caller's real index.
TREE=$(
  export GIT_INDEX_FILE="$TEMP_DIR/index"
  git read-tree "$SOURCE_COMMIT"
  git --literal-pathspecs add --force -- "${FILES[@]}"
  git write-tree
)
COMMIT=$(printf 'Release artifacts for version %s\n' "$VERSION" | \
  git -c user.name='github-actions[bot]' \
      -c user.email='41898282+github-actions[bot]@users.noreply.github.com' \
      commit-tree "$TREE" -p "$SOURCE_COMMIT")

if [[ "$PUSH" == true ]]; then
  # Snapshot remote refs and use explicit leases, including non-existence for new refs.
  # GitHub supports atomic pushes: reject the whole release if any ref has changed.
  REMOTE_STATE=$(git ls-remote --heads origin "${REFS[@]}")
  LEASES=()
  REFSPECS=()
  for ref in "${REFS[@]}"; do
    expected=''
    while IFS=$'\t' read -r oid name; do
      if [[ "$name" == "$ref" ]]; then
        expected=$oid
      fi
    done <<< "$REMOTE_STATE"
    if [[ "$ref" == "$EXACT_REF" && -n "$expected" ]]; then
      fail "Exact release branch already exists and is write-once: $EXACT_REF"
    fi
    LEASES+=("--force-with-lease=$ref:$expected")
    REFSPECS+=("$COMMIT:$ref")
  done
  git push --atomic "${LEASES[@]}" origin "${REFSPECS[@]}"
else
  # Local inspection mode; still leave HEAD, source branches, index and files alone.
  {
    printf 'start\n'
    for ref in "${REFS[@]}"; do
      printf 'update %s %s\n' "$ref" "$COMMIT"
    done
    printf 'prepare\ncommit\n'
  } | git update-ref --stdin
fi

printf 'Published artifact commit %s for %s (push=%s)\n' "$COMMIT" "$VERSION" "$PUSH"
printf '  %s\n' "${REFS[@]}"
