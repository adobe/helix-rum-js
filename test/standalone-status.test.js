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

const script = document.createElement('script');
script.src = `${window.location.origin}/rum-standalone.js`;
script.dataset.status = '429';
script.dataset.postPath = '/collect';
script.dataset.program = 'test-program';
Object.defineProperty(document, 'currentScript', {
  configurable: true,
  value: script,
});

await import('../src/standalone.js');

describe('standalone status checkpoints', () => {
  afterEach(() => {
    window.hlx.rum = undefined;
    Object.defineProperty(document, 'currentScript', {
      configurable: true,
      value: null,
    });
  });

  it('emits 4xx for a 429 response during initialization', () => {
    assert.deepEqual(window.hlx.rum.queue[0].slice(0, 2), [
      '4xx',
      { source: '', target: '429' },
    ]);
    assert.strictEqual(window.RUM_BASE.href, `${window.location.origin}/collect`);
    assert.deepEqual(window.RUM_PARAMS, { program: 'test-program' });
  });
});
