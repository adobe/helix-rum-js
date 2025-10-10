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
import { before, after } from './errors.js';
import { sampleRUM } from '../../src/index.js';

describe('sampleRUM PromiseRejectionEvent capture', () => {
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

  it('rum capture unhandled promise rejection where reason is a PromiseRejectionEvent with target', async () => {
    sampleRUM();

    // Create a mock target element
    const mockTarget = document.createElement('div');
    mockTarget.id = 'test-element';
    mockTarget.className = 'rejection-target';

    // Create a PromiseRejectionEvent-like object
    const rejectionEventLike = Object.create(PromiseRejectionEvent.prototype);
    Object.defineProperty(rejectionEventLike, 'target', {
      value: mockTarget,
      enumerable: true,
    });

    // Clear queue before dispatching to avoid race conditions
    config.queue.length = 0;

    // Dispatch the event asynchronously using setTimeout pattern
    window.setTimeout(() => {
      window.dispatchEvent(new PromiseRejectionEvent('unhandledrejection', {
        promise: Promise.resolve(),
        reason: rejectionEventLike,
      }));
    });

    // Wait for event processing (same pattern as test() helper)
    await new Promise((resolve) => {
      window.setTimeout(() => {
        resolve();
      }, 1500);
    });

    // Verify results
    assert.strictEqual(config.queue.length, 1, `Expected 1 event but got ${config.queue.length}`);
    const { source, target } = config.queue[0].data;
    assert.strictEqual(source, 'Unhandled Rejection');
    assert.ok(
      target.includes('div') && (target.includes('test-element') || target.includes('rejection-target')),
      `target should contain element information from outerHTML, got: ${target}`,
    );
  });

  it('rum capture unhandled promise rejection where reason is a PromiseRejectionEvent without target', async () => {
    sampleRUM();

    // Create a PromiseRejectionEvent-like object without target
    const rejectionEventLike = Object.create(PromiseRejectionEvent.prototype);
    // Explicitly set target to null to ensure the fallback path is tested
    Object.defineProperty(rejectionEventLike, 'target', {
      value: null,
      writable: false,
      enumerable: false,
    });
    Object.defineProperty(rejectionEventLike, 'customProperty', {
      value: 'test-value',
      enumerable: true,
    });
    Object.defineProperty(rejectionEventLike, 'anotherProperty', {
      value: 'another-value',
      enumerable: true,
    });

    // Clear queue before test
    config.queue.length = 0;

    // Create a promise that will be rejected but not handled
    // This avoids the double-event issue from manually dispatching
    window.setTimeout(() => {
      // Create a rejected promise with our custom event as the reason
      Promise.reject(rejectionEventLike);
    });

    // Wait for event processing (same pattern as test() helper)
    await new Promise((resolve) => {
      window.setTimeout(() => {
        resolve();
      }, 1500);
    });

    // Verify results - find the event matching our test case
    const promiseRejectionEvents = config.queue.filter((item) => {
      const { source, target } = item.data;
      return source === 'Unhandled Rejection'
        && target
        && target.includes('customProperty')
        && target.includes('anotherProperty');
    });

    assert.ok(promiseRejectionEvents.length >= 1, `Expected at least 1 matching PromiseRejectionEvent but got ${promiseRejectionEvents.length}`);
    const { source, target } = promiseRejectionEvents[0].data;
    assert.strictEqual(source, 'Unhandled Rejection');
    // When there's no target, it should fall back to listing property names
    // Both properties should be present in the joined string
    assert.ok(
      target.includes('customProperty') && target.includes('anotherProperty'),
      `target should contain both property names (joined with comma), got: ${target}`,
    );
  });
});
