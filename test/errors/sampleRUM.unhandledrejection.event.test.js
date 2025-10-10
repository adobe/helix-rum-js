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
import { sampleRUM } from '../../src/index.js';

describe('sampleRUM PromiseRejectionEvent capture', () => {
  const config = {
    listeners: null,
    queue: [],
  };

  beforeEach(() => {
    // eslint-disable-next-line no-param-reassign
    config.queue = [];

    const usp = new URLSearchParams(window.location.search);
    usp.append('rum', 'on');
    window.history.replaceState({}, '', `${window.location.pathname}?${usp.toString()}`);

    // eslint-disable-next-line no-param-reassign
    config.listeners = window.Mocha.process.listeners('uncaughtException');
    window.Mocha.process.removeAllListeners('uncaughtException');
    window.Mocha.process.on('uncaughtException', () => {});

    // Mock sendBeacon to capture error data
    // eslint-disable-next-line no-underscore-dangle
    navigator._sendBeacon = navigator.sendBeacon;
    navigator.sendBeacon = (url, d) => {
      const data = JSON.parse(d);
      if (data.checkpoint === 'error') {
        config.queue.push({ url, data });
      }
      return true;
    };
  });

  afterEach(() => {
    const usp = new URLSearchParams(window.location.search);
    usp.delete('rum');
    window.history.replaceState({}, '', `${window.location.pathname}?${usp.toString()}`);

    // Clear rum instance and remove event listeners
    // eslint-disable-next-line no-underscore-dangle
    if (window.hlx && window.hlx.rum) {
      // eslint-disable-next-line no-underscore-dangle
      window.hlx.rum = undefined;
    }

    const enhancer = document.querySelector('script[src*="rum-enhancer"]');
    if (enhancer) {
      enhancer.remove();
    }

    window.Mocha.process.removeAllListeners('uncaughtException');
    window.Mocha.process.removeAllListeners('error');
    window.Mocha.process.removeAllListeners('unhandledRejection');

    config.listeners.forEach((lst) => {
      window.Mocha.process.addListener('uncaughtException', lst);
    });
    // eslint-disable-next-line no-param-reassign
    config.listeners = undefined;
    // eslint-disable-next-line no-underscore-dangle
    navigator.sendBeacon = navigator._sendBeacon;
    // eslint-disable-next-line no-param-reassign
    config.queue = [];
  });

  it('rum capture unhandled promise rejection where reason is a PromiseRejectionEvent with target', (done) => {
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

    // Set up a one-time listener to verify the error was captured
    const originalSendBeacon = navigator.sendBeacon;
    let errorCaptured = false;
    navigator.sendBeacon = (url, d) => {
      if (errorCaptured) return true; // Ignore subsequent calls
      const data = JSON.parse(d);
      if (data.checkpoint === 'error') {
        errorCaptured = true;
        config.queue.push({ url, data });

        try {
          assert.strictEqual(config.queue.length, 1, 'Should capture exactly one error event');
          const { source, target } = config.queue[0].data;
          assert.strictEqual(source, 'Unhandled Rejection');
          assert.ok(
            target.includes('div') || target.includes('test-element') || target.includes('rejection-target'),
            `target should contain element information from outerHTML, got: ${target}`,
          );
          done();
        } catch (err) {
          done(err);
        } finally {
          navigator.sendBeacon = originalSendBeacon;
        }
      }
      return true;
    };

    // Manually trigger the unhandledrejection event
    window.dispatchEvent(new PromiseRejectionEvent('unhandledrejection', {
      promise: Promise.resolve(),
      reason: rejectionEventLike,
    }));
  });

  it('rum capture unhandled promise rejection where reason is a PromiseRejectionEvent without target', (done) => {
    sampleRUM();

    // Create a PromiseRejectionEvent-like object without target
    const rejectionEventLike = Object.create(PromiseRejectionEvent.prototype);
    // Explicitly set target to null/undefined to ensure the fallback path is tested
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

    // Set up a one-time listener to verify the error was captured
    const originalSendBeacon = navigator.sendBeacon;
    let errorCaptured = false;
    navigator.sendBeacon = (url, d) => {
      if (errorCaptured) return true; // Ignore subsequent calls
      const data = JSON.parse(d);
      if (data.checkpoint === 'error') {
        errorCaptured = true;
        config.queue.push({ url, data });

        try {
          assert.strictEqual(config.queue.length, 1, 'Should capture exactly one error event');
          const { source, target } = config.queue[0].data;
          assert.strictEqual(source, 'Unhandled Rejection');
          // When there's no target, it should fall back to listing property names
          assert.ok(
            target.includes('customProperty') || target.includes('anotherProperty'),
            `target should contain property names, got: ${target}`,
          );
          done();
        } catch (err) {
          done(err);
        } finally {
          navigator.sendBeacon = originalSendBeacon;
        }
      }
      return true;
    };

    // Manually trigger the unhandledrejection event
    window.dispatchEvent(new PromiseRejectionEvent('unhandledrejection', {
      promise: Promise.resolve(),
      reason: rejectionEventLike,
    }));
  });
});
