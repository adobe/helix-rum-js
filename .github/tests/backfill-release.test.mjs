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
import { execFileSync } from 'node:child_process';
import {
  mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync,
} from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { backfill, checkTarget, integrityOf } from '../scripts/backfill-release.mjs';

const NAME = '@adobe/helix-rum-js';

function sh(cwd, cmd, args) {
  return execFileSync(cmd, args, {
    cwd,
    encoding: 'utf8',
    env: {
      ...process.env,
      GIT_CONFIG_GLOBAL: '/dev/null',
      GIT_CONFIG_NOSYSTEM: '1',
      GIT_AUTHOR_NAME: 'Test',
      GIT_AUTHOR_EMAIL: 'test@example.com',
      GIT_COMMITTER_NAME: 'Test',
      GIT_COMMITTER_EMAIL: 'test@example.com',
    },
  }).trim();
}

async function fixture(t) {
  const dir = mkdtempSync(join(tmpdir(), 'rum-backfill-test-'));
  const remote = join(dir, 'remote.git');
  const work = join(dir, 'work');
  mkdirSync(work);
  const git = (...args) => sh(work, 'git', args);
  sh(dir, 'git', ['init', '--bare', '-q', remote]);
  git('init', '-q', '-b', 'main');
  writeFileSync(join(work, 'package.json'), `${JSON.stringify({ name: NAME, version: '0.0.0' })}\n`);
  mkdirSync(join(work, 'src'));
  writeFileSync(join(work, 'src/index.js'), '// source\n');
  git('add', 'package.json', 'src/index.js');
  git('commit', '-q', '-m', 'source');
  git('tag', 'v1.9.0');
  git('tag', 'v2.10.5');
  git('remote', 'add', 'origin', remote);
  git('push', '-q', 'origin', 'main', '--tags');

  // Published packages, served by a local registry.
  const packages = {};
  const publish = (version, files) => {
    const pkgDir = join(dir, `pkg-${version}`, 'package');
    mkdirSync(pkgDir, { recursive: true });
    writeFileSync(join(pkgDir, 'package.json'), `${JSON.stringify({ name: NAME, version })}\n`);
    Object.entries(files).forEach(([path, content]) => {
      mkdirSync(join(pkgDir, path, '..'), { recursive: true });
      writeFileSync(join(pkgDir, path), content);
    });
    const tgz = join(dir, `pkg-${version}.tgz`);
    sh(join(dir, `pkg-${version}`), 'tar', ['-czf', tgz, 'package']);
    packages[version] = readFileSync(tgz);
  };
  const tamper = {};
  const server = createServer((req, res) => {
    if (req.url === `/${NAME.replace('/', '%2f')}`) {
      const { port } = server.address();
      const versions = Object.fromEntries(Object.entries(packages).map(([v, bytes]) => [v, {
        dist: {
          tarball: `http://127.0.0.1:${port}/tarball/${v}.tgz`,
          integrity: tamper[v] || integrityOf(bytes),
        },
      }]));
      res.end(JSON.stringify({ versions }));
      return;
    }
    const m = req.url.match(/^\/tarball\/(.+)\.tgz$/);
    if (m && packages[m[1]]) {
      res.end(packages[m[1]]);
      return;
    }
    res.statusCode = 404;
    res.end();
  });
  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });
  t.after(() => {
    server.close();
    rmSync(dir, { recursive: true, force: true });
  });
  const registry = `http://127.0.0.1:${server.address().port}`;
  const run = (version, branch, push = true) => backfill({
    cwd: work, version, branch, push, registry, log: () => {},
  });
  const remoteGit = (...args) => sh(dir, 'git', [`--git-dir=${remote}`, ...args]);
  return {
    dir, work, git, remoteGit, publish, tamper, run,
  };
}

test('creates a missing alias branch from the tag with the npm files and package.json', async (t) => {
  const f = await fixture(t);
  f.publish('1.8.0', { 'src/index.js': '// 1.8.0\n' });
  f.publish('1.9.0', { 'src/index.js': '// published 1.9.0\n' });
  const result = await f.run('1.9.0', 'release-1-x');
  assert.equal(result.result, 'pushed');
  assert.deepEqual(result.add, ['src/index.js', 'package.json']);
  assert.equal(result.created, true);
  assert.equal(f.remoteGit('show', 'release-1-x:src/index.js'), '// published 1.9.0');
  assert.equal(JSON.parse(f.remoteGit('show', 'release-1-x:package.json')).version, '1.9.0');
  assert.equal(f.remoteGit('rev-parse', 'release-1-x^'), f.remoteGit('rev-parse', 'v1.9.0^{commit}'));
});

test('creates a missing branch even when the npm files equal the tag', async (t) => {
  const f = await fixture(t);
  f.publish('1.9.0', { 'src/index.js': '// source\n', 'src/index.map.js': '// debug\n' });
  const result = await f.run('1.9.0', 'release-1-x');
  assert.equal(result.result, 'pushed');
  assert.equal(f.remoteGit('rev-parse', 'release-1-x^'), f.remoteGit('rev-parse', 'v1.9.0^{commit}'));
  assert.equal(f.remoteGit('show', 'release-1-x:src/index.js'), '// source');
  assert.equal(JSON.parse(f.remoteGit('show', 'release-1-x:package.json')).version, '1.9.0');
  assert.throws(() => f.remoteGit('show', 'release-1-x:src/index.map.js'));
});

test('adds only the files an existing branch is missing', async (t) => {
  const f = await fixture(t);
  f.publish('2.10.5', { 'src/index.js': '// source\n', 'dist/rum-standalone.js': '// built\n' });
  f.git('push', '-q', 'origin', 'v2.10.5^{commit}:refs/heads/release-2-10-5');
  const before = f.remoteGit('rev-parse', 'release-2-10-5');
  const result = await f.run('2.10.5', 'release-2-10-5');
  assert.deepEqual(result.add, ['dist/rum-standalone.js']);
  assert.equal(f.remoteGit('rev-parse', 'release-2-10-5^'), before);
  assert.equal(f.remoteGit('show', 'release-2-10-5:dist/rum-standalone.js'), '// built');
  assert.equal(f.remoteGit('show', 'release-2-10-5:src/index.js'), '// source');
  assert.equal((await f.run('2.10.5', 'release-2-10-5')).result, 'already complete');
});

test('never changes a served file that differs from npm', async (t) => {
  const f = await fixture(t);
  f.publish('2.10.5', { 'src/index.js': '// different\n', 'dist/rum-standalone.js': '// built\n' });
  f.git('push', '-q', 'origin', 'v2.10.5^{commit}:refs/heads/release-2-10-5');
  const before = f.remoteGit('rev-parse', 'release-2-10-5');
  await assert.rejects(f.run('2.10.5', 'release-2-10-5'), /differ from .*not changing them: src\/index\.js/);
  assert.equal(f.remoteGit('rev-parse', 'release-2-10-5'), before);
});

test('rejects a tarball that does not match the registry integrity', async (t) => {
  const f = await fixture(t);
  f.publish('1.9.0', { 'src/index.js': '// 1.9.0\n' });
  f.tamper['1.9.0'] = integrityOf(Buffer.from('something else'));
  await assert.rejects(f.run('1.9.0', 'release-1-x'), /does not match the registry integrity/);
  assert.equal(f.remoteGit('branch', '--list', 'release-1-x'), '');
});

test('the branch must match the version', async (t) => {
  const f = await fixture(t);
  f.publish('1.8.0', { 'src/index.js': '// 1.8.0\n' });
  f.publish('1.9.0', { 'src/index.js': '// 1.9.0\n' });
  await assert.rejects(f.run('1.8.0', 'release-1-x'), /newest 1\.x release, 1\.9\.0/);
  await assert.rejects(f.run('1.9.0', 'release-2-x'), /not the release branch/);
  await assert.rejects(f.run('1.9.0', 'main'), /not the release branch/);
  await assert.rejects(f.run('1.9.1', 'release-1-9-1'), /not a published version/);
  assert.throws(() => checkTarget('1.9.0-rc-1', 'release-1-9-0-rc-1', ['1.9.0-rc-1']), /unsupported version/);
});

test('without --push nothing is written to the remote', async (t) => {
  const f = await fixture(t);
  f.publish('1.9.0', { 'src/index.js': '// 1.9.0\n' });
  const result = await f.run('1.9.0', 'release-1-x', false);
  assert.equal(result.result, 'planned');
  assert.equal(f.remoteGit('branch', '--list', 'release-1-x'), '');
});
