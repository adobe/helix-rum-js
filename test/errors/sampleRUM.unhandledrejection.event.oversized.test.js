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
import { test, before, after } from './errors.js';

describe('sampleRUM simple error capture', () => {
  const config = {
    listeners: null,
    queue: [],
  };
  beforeEach(() => {
    before(config);
  });

  afterEach(() => {
    after(config);
  });

  it('rum capture unhandled promise rejection truncates an oversized event target', async () => {
    await test(async () => {
      const div = document.createElement('div');
      div.id = 'oversized';
      div.textContent = 'x'.repeat(500);
      const event = new Event('error');
      div.dispatchEvent(event);
      await Promise.reject(event);
    }, (source) => {
      assert.strictEqual(source, 'Unhandled Rejection');
    }, (target) => {
      assert.strictEqual(target.length, 200, 'target should be capped at 200 characters');
      assert.ok(target.startsWith('<div id="oversized">'), `target should keep the head of the outerHTML, got: ${target}`);
    }, config.queue);
  });
});
