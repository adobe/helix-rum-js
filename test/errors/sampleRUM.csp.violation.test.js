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

import { assert } from '@esm-bundle/chai';
import { sampleRUM } from '../../src/index.js';

describe('sampleRUM CSP violation capture', () => {
  let originalSendBeacon;
  let capturedCalls;

  beforeEach(() => {
    // Set up RUM with rum=on parameter
    const usp = new URLSearchParams(window.location.search);
    usp.append('rum', 'on');
    window.history.replaceState({}, '', `${window.location.pathname}?${usp.toString()}`);

    // Mock sendBeacon to capture calls
    originalSendBeacon = navigator.sendBeacon;
    capturedCalls = [];

    navigator.sendBeacon = (url, data) => {
      const parsedData = JSON.parse(data);
      capturedCalls.push({ url, data: parsedData });
      return true;
    };

    // Initialize sampleRUM
    sampleRUM();
  });

  afterEach(() => {
    // Clean up
    const usp = new URLSearchParams(window.location.search);
    usp.delete('rum');
    window.history.replaceState({}, '', `${window.location.pathname}?${usp.toString()}`);

    // eslint-disable-next-line no-underscore-dangle
    window.hlx.rum = undefined;

    // Restore original sendBeacon
    navigator.sendBeacon = originalSendBeacon;

    // Remove any enhancer scripts
    const enhancer = document.querySelector('script[src*="rum-enhancer"]');
    if (enhancer) {
      enhancer.remove();
    }
  });

  it('should capture CSP violation for helix-rum-enhancer URI', (done) => {
    // Create a securitypolicyviolation event with helix-rum-enhancer URI
    const event = new Event('securitypolicyviolation');
    event.blockedURI = 'https://example.com/helix-rum-enhancer/script.js';
    event.violatedDirective = 'script-src';
    event.originalPolicy = 'script-src \'self\'';
    event.sourceFile = 'https://example.com/page.html';
    event.lineNumber = 10;
    event.columnNumber = 5;
    event.disposition = 'enforce';

    // Dispatch the event
    window.dispatchEvent(event);

    // Wait a bit for the event to be processed
    setTimeout(() => {
      // Find the CSP error call
      const cspCall = capturedCalls.find((call) => call.data.checkpoint === 'error' && call.data.source === 'csp');
      assert.ok(cspCall, 'sendBeacon should have been called for CSP violation');
      assert.strictEqual(cspCall.data.checkpoint, 'error');
      assert.strictEqual(cspCall.data.source, 'csp');
      assert.strictEqual(cspCall.data.target, 'https://example.com/helix-rum-enhancer/script.js');
      assert.ok(cspCall.data.t, 'should have timestamp');
      assert.ok(cspCall.data.id, 'should have RUM id');
      assert.strictEqual(cspCall.data.weight, 1);
      done();
    }, 100);
  });

  it('should not capture CSP violation for non-helix-rum-enhancer URI', (done) => {
    // Create a securitypolicyviolation event with different URI
    const event = new Event('securitypolicyviolation');
    event.blockedURI = 'https://example.com/other-script.js';
    event.violatedDirective = 'script-src';
    event.originalPolicy = 'script-src \'self\'';
    event.sourceFile = 'https://example.com/page.html';
    event.lineNumber = 10;
    event.columnNumber = 5;

    // Dispatch the event
    window.dispatchEvent(event);

    // Wait a bit for the event to be processed
    setTimeout(() => {
      // Check that no CSP error call was made
      const cspCall = capturedCalls.find((call) => call.data.checkpoint === 'error' && call.data.source === 'csp');
      assert.strictEqual(cspCall, undefined, 'sendBeacon should not have been called for non-helix-rum-enhancer URI');
      done();
    }, 100);
  });

  it('should capture CSP violation for URI containing helix-rum-enhancer anywhere in the path', (done) => {
    // Create a securitypolicyviolation event with helix-rum-enhancer in the middle of the URI
    const event = new Event('securitypolicyviolation');
    event.blockedURI = 'https://cdn.example.com/path/to/helix-rum-enhancer/v2/script.js';
    event.violatedDirective = 'script-src';
    event.originalPolicy = 'script-src \'self\'';
    event.sourceFile = 'https://example.com/page.html';
    event.lineNumber = 10;
    event.columnNumber = 5;
    event.disposition = 'enforce';

    // Dispatch the event
    window.dispatchEvent(event);

    // Wait a bit for the event to be processed
    setTimeout(() => {
      // Find the CSP error call
      const cspCall = capturedCalls.find((call) => call.data.checkpoint === 'error' && call.data.source === 'csp');
      assert.ok(cspCall, 'sendBeacon should have been called for CSP violation');
      assert.strictEqual(cspCall.data.checkpoint, 'error');
      assert.strictEqual(cspCall.data.source, 'csp');
      assert.strictEqual(cspCall.data.target, 'https://cdn.example.com/path/to/helix-rum-enhancer/v2/script.js');
      done();
    }, 100);
  });

  it('should allow CSP violation for URI containing helix-rum-enhancer anywhere in the path when report-only', (done) => {
    // Create a securitypolicyviolation event with helix-rum-enhancer in the middle of the URI
    const event = new Event('securitypolicyviolation');
    event.blockedURI = 'https://cdn.example.com/path/to/helix-rum-enhancer/v2/script.js';
    event.violatedDirective = 'script-src';
    event.originalPolicy = 'script-src \'self\'';
    event.sourceFile = 'https://example.com/page.html';
    event.lineNumber = 10;
    event.columnNumber = 5;
    event.disposition = 'report';

    // Dispatch the event
    window.dispatchEvent(event);

    // Wait a bit for the event to be processed
    setTimeout(() => {
      const cspCall = capturedCalls.find((call) => call.data.checkpoint === 'error' && call.data.source === 'csp');
      assert.strictEqual(cspCall, undefined, 'sendBeacon should not have been called for helix-rum-enhancer URI when report-only');
      done();
    }, 100);
  });
});
