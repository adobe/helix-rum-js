/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

import { assert } from '@esm-bundle/chai';

const params = new URLSearchParams(window.location.search);
params.set('rum', 'on');
window.history.replaceState({}, '', `${window.location.pathname}?${params}`);

const configured = new URL(`${window.location.origin}/proxy`);
window.RUM_BASE = configured;

const script = document.createElement('script');
script.src = `${window.location.origin}/rum-standalone.js`;
script.dataset.postPath = '/collect';
Object.defineProperty(document, 'currentScript', {
  configurable: true,
  value: script,
});

await import('../src/standalone.js');

describe('standalone window.RUM_BASE', () => {
  it('keeps a URL object', () => {
    assert.strictEqual(window.RUM_BASE, configured);
  });
});
