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

describe('sampleRUM', () => {
  beforeEach(() => {
    const usp = new URLSearchParams(window.location.search);
    usp.append('rum', 'on');
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

  it('rum initialization', () => {
    const sendBeaconArgs = {};
    // eslint-disable-next-line no-underscore-dangle
    navigator._sendBeacon = navigator.sendBeacon;
    navigator.sendBeacon = (url, data) => {
      sendBeaconArgs.url = url;
      sendBeaconArgs.data = JSON.parse(data);
      return true;
    };

    sampleRUM();

    assert.strictEqual(sendBeaconArgs.url, 'https://rum.hlx.page/.rum/1');
    assert.ok(sendBeaconArgs.data.id);
    assert.strictEqual(sendBeaconArgs.data.weight, 1);
    assert.strictEqual(sendBeaconArgs.data.checkpoint, 'top');
    // eslint-disable-next-line no-underscore-dangle
    navigator.sendBeacon = navigator._sendBeacon;
  });

  it('rum sendPing available', () => {
    const sendBeaconArgs = {};
    // eslint-disable-next-line no-underscore-dangle
    navigator._sendBeacon = navigator.sendBeacon;
    navigator.sendBeacon = (url, data) => {
      sendBeaconArgs.url = url;
      sendBeaconArgs.data = JSON.parse(data);
      return true;
    };

    sampleRUM();
    sampleRUM.sendPing('sendPingWorks', 0, { source: 'sourcetest', target: 'targettest' });
    assert.strictEqual(sendBeaconArgs.data.checkpoint, 'sendPingWorks');
    assert.strictEqual(sendBeaconArgs.data.source, 'sourcetest');
    assert.strictEqual(sendBeaconArgs.data.target, 'targettest');
    // eslint-disable-next-line no-underscore-dangle
    navigator.sendBeacon = navigator._sendBeacon;
  });

  it('rum checkpoint queuing', () => {
    sampleRUM();
    sampleRUM('test', {
      foo: 'bar',
      int: 1,
    });

    const [checkpoint, data, time] = window.hlx.rum.queue.pop();
    assert.strictEqual(checkpoint, 'test');
    assert.strictEqual(data.foo, 'bar');
    assert.strictEqual(data.int, 1);
    assert.ok(time);
  });

  it('rum checkpoint queuing not selected', () => {
    sampleRUM();
    window.hlx.rum.isSelected = false;
    sampleRUM('test', {
      foo: 'bar',
      int: 1,
    });
    assert.strictEqual(window.hlx.rum.queue.length, 0);
  });

  it('sampleRUM fire custom rum event', (done) => {
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

    it('loads rum enhancer', () => {
      sampleRUM();
      sampleRUM.enhance();
      const enhancer = document.querySelector('script[src*="rum-enhancer"]');
      assert.ok(enhancer);
    });

    it('loads rum enhancer when sampleRum is called twice', () => {
      sampleRUM();
      sampleRUM();
      sampleRUM.enhance();
      const enhancer = document.querySelector('script[src*="rum-enhancer"]');
      assert.ok(enhancer);
    });
  });

  describe('sampling rate', () => {
    it('allows forced sampling', async () => {
      sampleRUM();
      assert.strictEqual(window.hlx.rum.weight, 1);
    });
  });

  describe('initialization', () => {
    it('window.hlx.rum.id constraints', async () => {
      sampleRUM();

      const { id } = window.hlx.rum;

      assert.ok(id);
      assert.strictEqual(id.length, 9);
      assert.match(id, /^[0-9a-f]+$/);
    });
  });
});
