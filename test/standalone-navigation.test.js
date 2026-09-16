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
Object.defineProperty(document, 'currentScript', {
  configurable: true,
  value: script,
});

const performanceEntries = window.performance.getEntriesByType;
window.performance.getEntriesByType = (type) => {
  if (type === 'navigation') {
    return [{ name: window.location.href, responseStatus: 404 }];
  }
  return performanceEntries.call(window.performance, type);
};

const referrerDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'referrer');
Object.defineProperty(document, 'referrer', {
  configurable: true,
  value: 'https://example.com/source/page',
});

await import('../src/standalone.js');

Object.defineProperty(Document.prototype, 'referrer', referrerDescriptor);
window.performance.getEntriesByType = performanceEntries;

describe('standalone navigation status checkpoints', () => {
  it('emits 404 and 4xx using the navigation status and referrer', () => {
    assert.deepEqual(window.hlx.rum.queue.map(([checkpoint, data]) => ({ checkpoint, data })), [
      { checkpoint: '404', data: { source: 'https://example.com/source/page' } },
      { checkpoint: '4xx', data: { source: 'https://example.com/source/page', target: '404' } },
    ]);
  });
});
