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
/* eslint-disable no-unused-expressions */

import { assert, expect } from '@esm-bundle/chai';
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

  it('rum capture unhandled promise rejection where reason is an error object', async () => {
    await test(async () => {
      await new Promise((resolve, reject) => {
        reject(new Error('This is an unhandled promise rejection with error object'));
      });
    }, (source) => {
      expect(source).to.be.a('string');
      assert.ok(source.match(/sampleRUM.unhandledrejection.obj.test.js(.*):[\d]+:/), 'source should contain the file name and line number');
    }, (target) => {
      expect(target).to.equal('Error: This is an unhandled promise rejection with error object');
    }, config.queue);
  });
});
