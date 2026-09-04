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

  it('rum capture unhandled promise rejection where reason is a DOM event on a non-element', async () => {
    await test(async () => {
      // e.g. `xhr.onerror = reject` - the target is not part of the DOM
      const xhr = new XMLHttpRequest();
      const event = new Event('error');
      // `target` persists after dispatch (only `currentTarget`/`eventPhase` are reset),
      // so the xhr is still the target when the rejection is handled
      xhr.dispatchEvent(event);
      await Promise.reject(event);
    }, (source) => {
      assert.strictEqual(source, 'Unhandled Rejection');
    }, (target) => {
      assert.strictEqual(target, '[object XMLHttpRequest]');
    }, config.queue);
  });
});
