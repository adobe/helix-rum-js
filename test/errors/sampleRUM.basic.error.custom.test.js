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

import { assert, expect } from '@esm-bundle/chai';
import { test, before, after } from './errors.js';

class MyCustomError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}

describe('sampleRUM custom error obj capture', () => {
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

  it('rum capture simple error', async () => {
    await test(() => {
      throw new MyCustomError('This is an unexpected custom error');
    }, (source) => {
      expect(source).to.be.a('string');
      assert.ok(source.match(/sampleRUM.basic.error.custom.test.js/), 'source should contain the file name');
      assert.ok(source.match(/:40:/), 'source should contain the line number');
    }, (target) => {
      expect(target).to.equal('Error: This is an unexpected custom error');
    }, config.queue);
  });
});
