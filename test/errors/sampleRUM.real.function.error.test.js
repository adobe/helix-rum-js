/*
 * Copyright 2024 Adobe. All rights reserved.
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

import { assert } from '@esm-bundle/chai';
import {
  test, before, after, fireError,
} from './errors.js';

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

  it('rum capture implementation error in a module', async () => {
    await test(() => {
      fireError();
    }, (source) => {
      assert.ok(source.startsWith('fireError@'));
    }, (target) => {
      assert.ok(target.startsWith('TypeError:'));
    }, config.queue);
  });
});
