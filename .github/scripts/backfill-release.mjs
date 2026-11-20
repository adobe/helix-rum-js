#!/usr/bin/env node
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

// Backfill a served release-* branch from the published npm package, for versions whose
// branch lacks files (older taggers published only some of them) or doesn't exist (1.x).
//
//   node .github/scripts/backfill-release.mjs <version> <branch> [--push]
//
// - The package tarball is verified against the registry's sha512 integrity before use.
// - An existing branch only gets the files it is missing. If a file it already serves
//   differs from npm, nothing is published: served bytes are never changed.
// - A new branch starts from the v<version> tag commit and gets the package's built files
//   and package.json.
// - Debug builds (*.map.js) are not published: the loaders never request them.
// - The branch must be release-<version>, or release-<major>-x when <version> is the newest
//   published <major>.x release.
// - Without --push, only the plan is printed.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  lstatSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, sep } from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

const VERSION = /^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z]+(\.[0-9A-Za-z]+)*)?$/;
const STABLE = /^([0-9]+)\.([0-9]+)\.([0-9]+)$/;
const BUILD_DIRS = ['src', 'dist'];
const BOT = [
  '-c', 'user.name=github-actions[bot]',
  '-c', 'user.email=41898282+github-actions[bot]@users.noreply.github.com',
];

function fail(message) {
  throw new Error(`backfill-release: ${message}`);
}

function git(cwd, args, options = {}) {
  return execFileSync('git', args, {
    cwd, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], ...options,
  }).trim();
}

function compareStable(a, b) {
  const pa = a.match(STABLE).slice(1).map(Number);
  const pb = b.match(STABLE).slice(1).map(Number);
  return pa[0] - pb[0] || pa[1] - pb[1] || pa[2] - pb[2];
}

export function checkTarget(version, branch, publishedVersions) {
  if (!VERSION.test(version)) {
    fail(`unsupported version: ${version}`);
  }
  if (!publishedVersions.includes(version)) {
    fail(`${version} is not a published version`);
  }
  if (branch === `release-${version.replace(/[^0-9A-Za-z]/g, '-')}`) {
    return 'exact';
  }
  const alias = branch.match(/^release-([0-9]+)-x$/);
  if (alias && STABLE.test(version) && version.startsWith(`${alias[1]}.`)) {
    const newest = publishedVersions
      .filter((v) => STABLE.test(v) && v.startsWith(`${alias[1]}.`))
      .sort(compareStable)
      .pop();
    if (newest === version) {
      return 'alias';
    }
    fail(`${branch} must point to the newest ${alias[1]}.x release, ${newest}, not ${version}`);
  }
  fail(`${branch} is not the release branch for ${version}`);
  return undefined;
}

export function integrityOf(bytes) {
  return `sha512-${createHash('sha512').update(bytes).digest('base64')}`;
}

async function fetchOk(url) {
  const res = await fetch(url);
  if (!res.ok) {
    fail(`GET ${url} returned ${res.status}`);
  }
  return res;
}

function walk(root, dir) {
  const out = [];
  readdirSync(join(root, dir), { withFileTypes: true }).forEach((entry) => {
    const path = join(dir, entry.name);
    if (entry.isSymbolicLink()) {
      fail(`symlink in package: ${path}`);
    } else if (entry.isDirectory()) {
      out.push(...walk(root, path));
    } else if (entry.isFile() && entry.name.endsWith('.js') && !entry.name.endsWith('.map.js')) {
      out.push(path.split(sep).join('/'));
    }
  });
  return out;
}

function extract(tgz, work) {
  const entries = execFileSync('tar', ['-tzf', tgz], { encoding: 'utf8' }).split('\n').filter(Boolean);
  entries.forEach((entry) => {
    if (!entry.startsWith('package/') || entry.split('/').includes('..')) {
      fail(`unexpected path in tarball: ${entry}`);
    }
  });
  execFileSync('tar', ['-xzf', tgz, '-C', work]);
  const root = join(work, 'package');
  const files = BUILD_DIRS
    .filter((dir) => {
      try {
        return lstatSync(join(root, dir)).isDirectory();
      } catch (e) {
        return false;
      }
    })
    .flatMap((dir) => walk(root, dir))
    .sort();
  if (files.length === 0) {
    fail(`no built .js files under ${BUILD_DIRS.join(', ')} in the package`);
  }
  return { root, files };
}

function remoteTip(cwd, branch) {
  const out = git(cwd, ['ls-remote', '--heads', 'origin', `refs/heads/${branch}`]);
  return out ? out.split('\t')[0] : '';
}

function fetchCommit(cwd, ref) {
  git(cwd, ['fetch', '--quiet', '--no-tags', '--depth=1', 'origin', ref]);
  return git(cwd, ['rev-parse', 'FETCH_HEAD^{commit}']);
}

function blobAt(cwd, commit, path) {
  try {
    return git(cwd, ['rev-parse', '--verify', '--quiet', `${commit}:${path}`]);
  } catch (e) {
    return '';
  }
}

export async function backfill({
  cwd = process.cwd(), version, branch, push = false,
  registry = process.env.NPM_REGISTRY || 'https://registry.npmjs.org',
  log = (line) => process.stdout.write(`${line}\n`),
}) {
  const { name } = JSON.parse(readFileSync(join(cwd, 'package.json'), 'utf8'));
  const doc = await (await fetchOk(`${registry}/${name.replace('/', '%2f')}`)).json();
  const kind = checkTarget(version, branch, Object.keys(doc.versions || {}));
  const { dist } = doc.versions[version];
  if (!dist || !/^sha512-/.test(dist.integrity || '')) {
    fail(`${name}@${version} has no sha512 integrity in the registry`);
  }
  const bytes = Buffer.from(await (await fetchOk(dist.tarball)).arrayBuffer());
  if (integrityOf(bytes) !== dist.integrity) {
    fail(`${name}@${version} tarball does not match the registry integrity ${dist.integrity}`);
  }

  const work = mkdtempSync(join(tmpdir(), 'rum-backfill-'));
  try {
    const tgz = join(work, 'package.tgz');
    writeFileSync(tgz, bytes);
    const { root, files } = extract(tgz, work);

    const tip = remoteTip(cwd, branch);
    const base = tip ? fetchCommit(cwd, `refs/heads/${branch}`) : fetchCommit(cwd, `refs/tags/v${version}`);
    const add = [];
    const conflicts = [];
    const candidates = tip ? files : [...files, 'package.json'];
    candidates.forEach((path) => {
      const blob = git(cwd, ['hash-object', '-w', join(root, path)]);
      const existing = blobAt(cwd, base, path);
      if (!existing || (!tip && existing !== blob)) {
        add.push({ path, blob });
      } else if (existing !== blob) {
        conflicts.push(path);
      }
    });
    if (conflicts.length) {
      fail(`${branch} serves files that differ from ${name}@${version}; not changing them: ${conflicts.join(', ')}`);
    }
    const plan = {
      package: name,
      version,
      branch,
      kind,
      integrity: dist.integrity,
      base,
      created: !tip,
      add: add.map(({ path }) => path),
      push,
    };
    if (tip && add.length === 0) {
      log(JSON.stringify({ ...plan, result: 'already complete' }));
      return { ...plan, result: 'already complete' };
    }

    const env = { ...process.env, GIT_INDEX_FILE: join(work, 'index') };
    git(cwd, ['read-tree', base], { env });
    add.forEach(({ path, blob }) => {
      git(cwd, ['update-index', '--add', '--cacheinfo', `100644,${blob},${path}`], { env });
    });
    const tree = git(cwd, ['write-tree'], { env });
    const message = `Backfill ${name}@${version} from npm\n\n${add.length} file(s) from the registry tarball, verified against ${dist.integrity}.\n`;
    const commit = git(cwd, [...BOT, 'commit-tree', tree, '-p', base], { input: message });
    if (push) {
      git(cwd, ['push', '--quiet', `--force-with-lease=refs/heads/${branch}:${tip}`, 'origin', `${commit}:refs/heads/${branch}`]);
    }
    const result = { ...plan, commit, result: push ? 'pushed' : 'planned' };
    log(JSON.stringify(result));
    return result;
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

async function main(argv) {
  const push = argv.includes('--push');
  const [version, branch, ...rest] = argv.filter((a) => a !== '--push');
  if (!version || !branch || rest.length) {
    fail('usage: backfill-release.mjs <version> <branch> [--push]');
  }
  await backfill({ version, branch, push });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).catch((e) => {
    process.stderr.write(`${e.message}\n`);
    process.exit(1);
  });
}
