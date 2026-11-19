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

// Release manifest: every executable file a release serves, with its SHA-384 digest.
//
//   node release-manifest.mjs write [manifest]            after the build (prepack)
//   node release-manifest.mjs verify <manifest> <version> before publishing branches
//   node release-manifest.mjs files <manifest>            one path per line, for tagger.sh
//
// The file list comes from the build output, not from a hand-maintained list, so a new
// plugin cannot be silently left out of a release.
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import {
  lstatSync, readdirSync, readFileSync, writeFileSync,
} from 'node:fs';
import { join, sep } from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

export const SCHEMA = 1;
export const DEFAULT_MANIFEST = 'release-manifest.json';

// Build output directories per package. Only .js files are executable release assets.
export const BUILD_ROOTS = {
  '@adobe/helix-rum-js': ['dist'],
  '@adobe/helix-rum-enhancer': ['src'],
};

function fail(message) {
  throw new Error(`release-manifest: ${message}`);
}

function readPackage(cwd) {
  return JSON.parse(readFileSync(join(cwd, 'package.json'), 'utf8'));
}

function walk(cwd, dir) {
  const out = [];
  readdirSync(join(cwd, dir), { withFileTypes: true }).forEach((entry) => {
    const path = join(dir, entry.name);
    if (entry.isSymbolicLink()) {
      fail(`symlink in build output: ${path}`);
    } else if (entry.isDirectory()) {
      out.push(...walk(cwd, path));
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      out.push(path.split(sep).join('/'));
    }
  });
  return out;
}

export function builtFiles(cwd, name) {
  const roots = BUILD_ROOTS[name];
  if (!roots) {
    fail(`no build roots configured for ${name}`);
  }
  const files = roots.flatMap((root) => walk(cwd, root)).sort();
  if (files.length === 0) {
    fail(`no built .js files under ${roots.join(', ')}; run the build first`);
  }
  return files;
}

export function digest(cwd, path) {
  const stat = lstatSync(join(cwd, path));
  if (!stat.isFile()) {
    fail(`not a regular file: ${path}`);
  }
  const bytes = readFileSync(join(cwd, path));
  return {
    integrity: `sha384-${createHash('sha384').update(bytes).digest('base64')}`,
    size: bytes.length,
  };
}

function sourceCommit(cwd) {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch (e) {
    return undefined;
  }
}

export function createManifest(cwd) {
  const pkg = readPackage(cwd);
  const files = {};
  builtFiles(cwd, pkg.name).forEach((path) => {
    files[path] = digest(cwd, path);
  });
  const commit = sourceCommit(cwd);
  return {
    schema: SCHEMA,
    package: pkg.name,
    version: pkg.version,
    ...(commit ? { source: { commit } } : {}),
    files,
  };
}

export function readManifest(cwd, manifestPath) {
  const manifest = JSON.parse(readFileSync(join(cwd, manifestPath), 'utf8'));
  if (manifest.schema !== SCHEMA || typeof manifest.files !== 'object' || !manifest.files) {
    fail(`${manifestPath} is not a schema ${SCHEMA} release manifest`);
  }
  Object.keys(manifest.files).forEach((path) => {
    if (path.startsWith('/') || path.split('/').includes('..')) {
      fail(`unsafe path in manifest: ${path}`);
    }
  });
  return manifest;
}

export function verifyManifest(cwd, manifestPath, version) {
  const manifest = readManifest(cwd, manifestPath);
  const pkg = readPackage(cwd);
  const problems = [];
  if (manifest.package !== pkg.name) {
    problems.push(`package ${manifest.package} does not match ${pkg.name}`);
  }
  if (manifest.version !== version) {
    problems.push(`version ${manifest.version} does not match ${version}`);
  }
  const listed = Object.keys(manifest.files).sort();
  const built = builtFiles(cwd, pkg.name);
  built.filter((path) => !listed.includes(path)).forEach((path) => problems.push(`built but not in manifest: ${path}`));
  listed.filter((path) => !built.includes(path)).forEach((path) => problems.push(`in manifest but not built: ${path}`));
  listed.filter((path) => built.includes(path)).forEach((path) => {
    const actual = digest(cwd, path);
    const expected = manifest.files[path];
    if (actual.integrity !== expected.integrity || actual.size !== expected.size) {
      problems.push(`digest mismatch: ${path}`);
    }
  });
  if (problems.length) {
    fail(`${manifestPath} failed verification:\n  ${problems.join('\n  ')}`);
  }
  return manifest;
}

function main([command, ...args]) {
  const cwd = process.cwd();
  if (command === 'write') {
    const path = args[0] || DEFAULT_MANIFEST;
    const manifest = createManifest(cwd);
    writeFileSync(join(cwd, path), `${JSON.stringify(manifest, null, 2)}\n`);
    process.stdout.write(`Wrote ${path}: ${manifest.package}@${manifest.version}, ${Object.keys(manifest.files).length} files\n`);
  } else if (command === 'verify' && args.length === 2) {
    verifyManifest(cwd, args[0], args[1]);
  } else if (command === 'files' && args.length === 1) {
    process.stdout.write(Object.keys(readManifest(cwd, args[0]).files).map((p) => `${p}\n`).join(''));
  } else {
    fail('usage: write [manifest] | verify <manifest> <version> | files <manifest>');
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main(process.argv.slice(2));
  } catch (e) {
    process.stderr.write(`${e.message}\n`);
    process.exit(1);
  }
}
