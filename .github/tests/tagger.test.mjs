/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import process from 'node:process';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('../../tagger.sh', import.meta.url));
const manifestTool = fileURLToPath(new URL('../../release-manifest.mjs', import.meta.url));
const realGit = '/usr/bin/git';

function fixture(t) {
  const dir = mkdtempSync(join(tmpdir(), 'rum-tagger-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const work = join(dir, 'work');
  const remote = join(dir, 'remote.git');
  mkdirSync(work);
  const env = {
    ...process.env,
    PATH: `/usr/bin:/bin:${process.env.PATH}`,
    GIT_CONFIG_GLOBAL: '/dev/null',
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_AUTHOR_NAME: 'Release test',
    GIT_AUTHOR_EMAIL: 'release-test@example.com',
    GIT_COMMITTER_NAME: 'Release test',
    GIT_COMMITTER_EMAIL: 'release-test@example.com',
  };
  const run = (command, args, extraEnv = {}) => spawnSync(command, args, {
    cwd: work, env: { ...env, ...extraEnv }, encoding: 'utf8',
  });
  const git = (...args) => {
    const result = run(realGit, args);
    assert.equal(result.status, 0, result.stderr);
    return result.stdout.trim();
  };
  git('init', '--bare', remote);
  git('init', '-b', 'main');
  writeFileSync(join(work, '.gitignore'), 'dist/\nrelease-notes.md\n');
  writeFileSync(join(work, 'package.json'), '{"name":"@adobe/helix-rum-js","version":"1.0.0"}\n');
  writeFileSync(join(work, 'README.md'), 'committed source\n');
  copyFileSync(script, join(work, 'tagger.sh'));
  copyFileSync(manifestTool, join(work, 'release-manifest.mjs'));
  git('add', '.');
  git('commit', '-m', 'initial source');
  git('remote', 'add', 'origin', remote);
  git('push', 'origin', 'main');
  const source = git('rev-parse', 'HEAD');
  mkdirSync(join(work, 'dist'));
  const artifacts = ['dist/client.js', 'package.json', 'release-notes.md'];
  const generate = (version) => {
    writeFileSync(join(work, 'dist/client.js'), `// generated ${version}\n`);
    writeFileSync(join(work, 'package.json'), `${JSON.stringify({ name: '@adobe/helix-rum-js', version })}\n`);
    writeFileSync(join(work, 'release-notes.md'), `Notes for ${version}\n`);
  };
  const publish = (version, push = false, paths = artifacts, extraEnv = {}) => run('/bin/bash', ['tagger.sh', version, ...paths, ...(push ? ['--push'] : [])], extraEnv);
  const remoteGit = (...args) => git(`--git-dir=${remote}`, ...args);
  return {
    dir, work, remote, run, git, remoteGit, source, generate, publish,
  };
}

test('local artifact refs preserve HEAD, dirty source files and the caller index', (t) => {
  const f = fixture(t);
  f.generate('2.3.4');
  writeFileSync(join(f.work, 'README.md'), 'unrelated staged edit\n');
  f.git('add', 'README.md');
  const index = f.git('write-tree');
  const status = f.git('status', '--porcelain');
  const result = f.publish('2.3.4');
  assert.equal(result.status, 0, result.stderr);
  const refs = ['release-2-3-4', 'release-2-3-x', 'release-2-x'];
  const commits = refs.map((ref) => f.git('rev-parse', ref));
  assert.equal(new Set(commits).size, 1);
  assert.equal(f.git('rev-parse', 'HEAD'), f.source);
  assert.equal(f.git('symbolic-ref', '--short', 'HEAD'), 'main');
  assert.equal(f.git('write-tree'), index);
  assert.equal(f.git('status', '--porcelain'), status);
  assert.equal(f.git('show', 'release-2-x:README.md'), 'committed source');
  assert.equal(JSON.parse(f.git('show', 'release-2-x:package.json')).version, '2.3.4');
  assert.equal(f.git('show', 'release-2-x:dist/client.js'), '// generated 2.3.4');
  assert.equal(f.remoteGit('rev-parse', 'main'), f.source);
});

test('atomic remote publication works from detached HEAD without updating local refs', (t) => {
  const f = fixture(t);
  f.git('checkout', '--detach');
  f.generate('2.3.4');
  const status = f.git('status', '--porcelain');
  const result = f.publish('2.3.4', true);
  assert.equal(result.status, 0, result.stderr);
  const published = f.remoteGit('rev-parse', 'release-2-3-4');
  assert.equal(f.remoteGit('rev-parse', 'release-2-3-x'), published);
  assert.equal(f.remoteGit('rev-parse', 'release-2-x'), published);
  assert.equal(f.remoteGit('rev-parse', `${published}^`), f.source);
  assert.equal(f.remoteGit('show', 'release-2-x:release-notes.md'), 'Notes for 2.3.4');
  assert.equal(f.remoteGit('rev-parse', 'main'), f.source);
  assert.equal(f.git('rev-parse', 'HEAD'), f.source);
  assert.equal(f.run(realGit, ['symbolic-ref', '-q', 'HEAD']).status, 1);
  assert.equal(f.git('status', '--porcelain'), status);
  assert.equal(f.git('for-each-ref', '--format=%(refname)', 'refs/heads/release-*'), '');
});

test('a later stable release advances aliases but leaves earlier exact versions untouched', (t) => {
  const f = fixture(t);
  f.generate('2.3.4');
  assert.equal(f.publish('2.3.4', true).status, 0);
  const old = f.remoteGit('rev-parse', 'release-2-3-4');
  f.generate('2.3.5');
  const result = f.publish('2.3.5', true);
  assert.equal(result.status, 0, result.stderr);
  const next = f.remoteGit('rev-parse', 'release-2-3-5');
  assert.notEqual(next, old);
  assert.equal(f.remoteGit('rev-parse', 'release-2-3-4'), old);
  assert.equal(f.remoteGit('rev-parse', 'release-2-3-x'), next);
  assert.equal(f.remoteGit('rev-parse', 'release-2-x'), next);
});

test('prereleases create only the normalized exact branch', (t) => {
  const f = fixture(t);
  f.generate('2.4.0-rc.1');
  assert.equal(f.publish('2.4.0-rc.1').status, 0);
  assert.equal(
    f.git('for-each-ref', '--format=%(refname)', 'refs/heads/release-*'),
    'refs/heads/release-2-4-0-rc-1',
  );
});

test('missing files, invalid versions, traversal and symlinks fail before ref changes', (t) => {
  const f = fixture(t);
  f.generate('2.3.4');
  const before = f.git('show-ref');
  assert.notEqual(f.publish('2.3.4', false, ['missing.js']).status, 0);
  assert.notEqual(f.publish('not-a-version').status, 0);
  assert.notEqual(f.publish('2.3.4', false, ['../outside.js']).status, 0);
  assert.notEqual(f.publish('2.3.4', false, [join(f.work, 'package.json')]).status, 0);
  assert.notEqual(f.publish('2.3.4', false, []).status, 0);
  symlinkSync('client.js', join(f.work, 'dist/link.js'));
  assert.notEqual(f.publish('2.3.4', false, ['dist/link.js']).status, 0);
  symlinkSync('dist', join(f.work, 'linked-dir'));
  assert.notEqual(f.publish('2.3.4', false, ['linked-dir/client.js']).status, 0);
  assert.equal(f.git('show-ref'), before);
});

test('paths with spaces are literal, and local publication refuses a checked-out target', (t) => {
  const f = fixture(t);
  writeFileSync(join(f.work, 'dist/file name.js'), 'literal path\n');
  const result = f.publish('2.3.4', false, ['dist/file name.js']);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(f.git('show', 'release-2-x:dist/file name.js'), 'literal path');
  f.git('worktree', 'add', join(f.dir, 'other-worktree'), 'release-2-x');
  const before = f.git('show-ref');
  assert.notEqual(f.publish('2.3.5', false, ['dist/file name.js']).status, 0);
  assert.equal(f.git('show-ref'), before);
});

test('one rejected remote ref rejects the entire atomic release', (t) => {
  const f = fixture(t);
  f.generate('2.3.4');
  assert.equal(f.publish('2.3.4', true).status, 0);
  const before = f.git('ls-remote', '--heads', 'origin');
  writeFileSync(join(f.remote, 'hooks/update'), '#!/bin/sh\ncase "$1" in\n  refs/heads/release-2-4-x) exit 1;;\nesac\nexit 0\n', { mode: 0o755 });
  f.generate('2.4.0');
  assert.notEqual(f.publish('2.4.0', true).status, 0);
  assert.equal(f.git('ls-remote', '--heads', 'origin'), before);
  assert.equal(f.git('rev-parse', 'HEAD'), f.source);
});

test('a concurrent alias update causes a stale lease and no partial publication', (t) => {
  const f = fixture(t);
  f.generate('2.3.4');
  assert.equal(f.publish('2.3.4', true).status, 0);
  const oldMinor = f.remoteGit('rev-parse', 'release-2-3-x');
  const shim = join(f.dir, 'shim');
  mkdirSync(shim);
  writeFileSync(join(shim, 'git'), `#!/bin/sh
if [ "$1" = ls-remote ]; then
  "$TEST_REAL_GIT" "$@" || exit
  "$TEST_REAL_GIT" --git-dir="$TEST_REMOTE" update-ref refs/heads/release-2-x "$TEST_STALE_SHA"
else
  exec "$TEST_REAL_GIT" "$@"
fi
`, { mode: 0o755 });
  f.generate('2.3.5');
  const result = f.publish('2.3.5', true, undefined, {
    PATH: `${shim}:/usr/bin:/bin`,
    TEST_REAL_GIT: realGit,
    TEST_REMOTE: f.remote,
    TEST_STALE_SHA: f.source,
  });
  assert.notEqual(result.status, 0);
  assert.equal(f.remoteGit('rev-parse', 'release-2-x'), f.source);
  assert.equal(f.remoteGit('rev-parse', 'release-2-3-x'), oldMinor);
  assert.notEqual(f.run(realGit, [`--git-dir=${f.remote}`, 'show-ref', '--verify', 'refs/heads/release-2-3-5']).status, 0);
  assert.equal(readFileSync(join(f.work, 'dist/client.js'), 'utf8'), '// generated 2.3.5\n');
});

test('an existing exact release branch is write-once, remotely and locally', (t) => {
  const f = fixture(t);
  f.generate('2.3.4');
  assert.equal(f.publish('2.3.4', true).status, 0);
  const remote = f.git('ls-remote', '--heads', 'origin');
  writeFileSync(join(f.work, 'dist/client.js'), '// tampered\n');
  const again = f.publish('2.3.4', true);
  assert.notEqual(again.status, 0);
  assert.match(again.stderr, /write-once/);
  assert.equal(f.git('ls-remote', '--heads', 'origin'), remote);

  assert.equal(f.publish('2.3.4').status, 0);
  const local = f.git('show-ref');
  const localAgain = f.publish('2.3.4');
  assert.notEqual(localAgain.status, 0);
  assert.match(localAgain.stderr, /write-once/);
  assert.equal(f.git('show-ref'), local);
});

test('--manifest publishes every built file listed in a verified manifest', (t) => {
  const f = fixture(t);
  f.generate('2.3.4');
  writeFileSync(join(f.work, 'dist/extra.js'), '// another built file\n');
  const write = f.run('node', ['release-manifest.mjs', 'write']);
  assert.equal(write.status, 0, write.stderr);
  const result = f.publish('2.3.4', true, ['--manifest', 'release-manifest.json', 'package.json']);
  assert.equal(result.status, 0, result.stderr);
  const tree = f.remoteGit('ls-tree', '-r', '--name-only', 'release-2-3-4').split('\n');
  ['dist/client.js', 'dist/extra.js', 'release-manifest.json', 'package.json']
    .forEach((file) => assert.ok(tree.includes(file), file));
  const manifest = JSON.parse(f.remoteGit('show', 'release-2-x:release-manifest.json'));
  assert.equal(manifest.version, '2.3.4');
  assert.deepEqual(Object.keys(manifest.files), ['dist/client.js', 'dist/extra.js']);
  assert.match(manifest.files['dist/client.js'].integrity, /^sha384-[A-Za-z0-9+/]{64}$/);
  assert.equal(manifest.source.commit, f.source);
});

test('a stale, incomplete or mismatched manifest fails before any ref changes', (t) => {
  const f = fixture(t);
  f.generate('2.3.4');
  assert.equal(f.run('node', ['release-manifest.mjs', 'write']).status, 0);
  const before = f.git('ls-remote', '--heads', 'origin');
  const args = ['--manifest', 'release-manifest.json'];

  writeFileSync(join(f.work, 'dist/client.js'), '// changed after the manifest was written\n');
  const changed = f.publish('2.3.4', true, args);
  assert.notEqual(changed.status, 0);
  assert.match(changed.stderr, /digest mismatch: dist\/client\.js/);

  f.generate('2.3.4');
  writeFileSync(join(f.work, 'dist/new-plugin.js'), '// built but not listed\n');
  const incomplete = f.publish('2.3.4', true, args);
  assert.notEqual(incomplete.status, 0);
  assert.match(incomplete.stderr, /built but not in manifest: dist\/new-plugin\.js/);

  rmSync(join(f.work, 'dist/new-plugin.js'));
  const wrongVersion = f.publish('2.3.5', true, args);
  assert.notEqual(wrongVersion.status, 0);
  assert.match(wrongVersion.stderr, /version 2\.3\.4 does not match 2\.3\.5/);

  assert.equal(f.git('ls-remote', '--heads', 'origin'), before);
});

test('versions whose branch name would be ambiguous are rejected before any ref changes', (t) => {
  const f = fixture(t);
  f.generate('2.4.0');
  const before = f.git('show-ref');
  ['2.4.0-rc-1', '2.4.0+build.1', '2.4.0-rc.1+build', '2.4.0-rc.1-x'].forEach((version) => {
    const result = f.publish(version);
    assert.notEqual(result.status, 0, version);
    assert.match(result.stderr, /Unsupported version/, version);
  });
  assert.equal(f.git('show-ref'), before);
  assert.equal(f.publish('2.4.0-rc.1').status, 0);
});

test('--check passes for a new version and fails once its exact branch exists', (t) => {
  const f = fixture(t);
  const check = (version) => f.run('/bin/bash', ['tagger.sh', version, '--check']);
  const ok = check('2.3.4');
  assert.equal(ok.status, 0, ok.stderr);
  assert.match(ok.stdout, /release-2-3-4 is available/);
  f.generate('2.3.4');
  assert.equal(f.publish('2.3.4', true).status, 0);
  const remote = f.git('ls-remote', '--heads', 'origin');
  const taken = check('2.3.4');
  assert.notEqual(taken.status, 0);
  assert.match(taken.stderr, /write-once/);
  assert.equal(check('2.3.5').status, 0);
  assert.notEqual(f.run('/bin/bash', ['tagger.sh', '2.3.5', '--check', 'package.json']).status, 0);
  assert.notEqual(f.run('/bin/bash', ['tagger.sh', '2.3.5', '--check', '--push']).status, 0);
  f.git('remote', 'set-url', 'origin', join(f.dir, 'missing.git'));
  const offline = check('2.3.5');
  assert.notEqual(offline.status, 0);
  assert.match(offline.stderr, /Cannot check/);
  f.git('remote', 'set-url', 'origin', f.remote);
  assert.equal(f.git('ls-remote', '--heads', 'origin'), remote);
});

test('release-manifest.mjs accepts an absolute manifest path', (t) => {
  const f = fixture(t);
  f.generate('2.3.4');
  const path = join(f.dir, 'elsewhere.json');
  const write = f.run('node', ['release-manifest.mjs', 'write', path]);
  assert.equal(write.status, 0, write.stderr);
  assert.equal(JSON.parse(readFileSync(path, 'utf8')).version, '2.3.4');
  const verify = f.run('node', ['release-manifest.mjs', 'verify', path, '2.3.4']);
  assert.equal(verify.status, 0, verify.stderr);
});
