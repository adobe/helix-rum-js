/*
 * Copyright 2023 Adobe. All rights reserved.
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
import { sampleRUM } from '../src/index.js';

describe('sampleRUM - RUM disabled', () => {
  beforeEach(() => {
    const usp = new URLSearchParams(window.location.search);
    usp.append('rum', 'off');
    window.history.replaceState({}, '', `${window.location.pathname}?${usp.toString()}`);
  });

  afterEach(() => {
    const usp = new URLSearchParams(window.location.search);
    usp.delete('rum');
    window.history.replaceState({}, '', `${window.location.pathname}?${usp.toString()}`);
    // eslint-disable-next-line no-underscore-dangle
    window.hlx.rum = undefined;

    const enhancer = document.querySelector('script[src*="rum-enhancer"]');
    if (enhancer) {
      enhancer.remove();
    }
  });

  it('no beacon sent', () => {
    const sendBeaconArgs = {};
    // eslint-disable-next-line no-underscore-dangle
    navigator._sendBeacon = navigator.sendBeacon;
    navigator.sendBeacon = (url, data) => {
      sendBeaconArgs.url = url;
      sendBeaconArgs.data = JSON.parse(data);
      return true;
    };

    sampleRUM();

    assert.strictEqual(Object.keys(sendBeaconArgs).length, 0);
    // eslint-disable-next-line no-underscore-dangle
    navigator.sendBeacon = navigator._sendBeacon;
  });

  it('sampleRUM fire custom rum event even if RUM is disabled', (done) => {
    const cb = (event) => {
      document.removeEventListener('rum', cb);

      assert.strictEqual(event.detail.checkpoint, 'test');
      assert.strictEqual(event.detail.data.foo, 'bar');
      assert.strictEqual(event.detail.data.int, 1);
      done();
    };

    document.addEventListener('rum', cb);

    sampleRUM('test', {
      foo: 'bar',
      int: 1,
    });
  });

  describe('rum enhancer', () => {
    beforeEach(() => {
      window.hlx = window.hlx || {};
      window.hlx.RUM_MANUAL_ENHANCE = true;
    });

    afterEach(() => {
      window.hlx.RUM_MANUAL_ENHANCE = undefined;
    });

    it('does not load rum enhancer', () => {
      sampleRUM();
      sampleRUM.enhance();
      const enhancer = document.querySelector('script[src*="rum-enhancer"]');
      assert.ok(!enhancer);
    });
  });

  describe('sampling rate', () => {
    it('allows high sampling rate', async () => {
      window.SAMPLE_PAGEVIEWS_AT_RATE = 'high';
      sampleRUM();
      assert.strictEqual(window.hlx.rum.weight, 10);
    });
    it('allows low sampling rate', async () => {
      window.SAMPLE_PAGEVIEWS_AT_RATE = 'low';
      sampleRUM();
      assert.strictEqual(window.hlx.rum.weight, 1000);
    });
    it('defaults to 100 sampling rate', async () => {
      const usp = new URLSearchParams(window.location.search);
      usp.delete('rum');
      window.history.replaceState({}, '', `${window.location.pathname}?${usp.toString()}`);
      delete window.SAMPLE_PAGEVIEWS_AT_RATE;
      sampleRUM();
      assert.strictEqual(window.hlx.rum.weight, 100);
    });
  });
});
