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

import { assert } from '@esm-bundle/chai';
import { sampleRUM } from '../src/index.js';

describe('sampleRUM - optel parameter', () => {
  afterEach(() => {
    const usp = new URLSearchParams(window.location.search);
    usp.delete('rum');
    usp.delete('optel');
    window.history.replaceState({}, '', `${window.location.pathname}?${usp.toString()}`);
    // eslint-disable-next-line no-underscore-dangle
    window.hlx.rum = undefined;

    const enhancer = document.querySelector('script[src*="rum-enhancer"]');
    if (enhancer) {
      enhancer.remove();
    }
  });

  describe('optel parameter - enabled states', () => {
    it('optel=on enables RUM with weight 1', () => {
      const usp = new URLSearchParams(window.location.search);
      usp.append('optel', 'on');
      window.history.replaceState({}, '', `${window.location.pathname}?${usp.toString()}`);

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
      assert.strictEqual(sendBeaconArgs.data.weight, 1);
      assert.strictEqual(sendBeaconArgs.data.checkpoint, 'top');
      assert.strictEqual(window.hlx.rum.isSelected, true);
      // eslint-disable-next-line no-underscore-dangle
      navigator.sendBeacon = navigator._sendBeacon;
    });

    it('optel=high enables RUM with weight 10', () => {
      const usp = new URLSearchParams(window.location.search);
      usp.append('optel', 'high');
      window.history.replaceState({}, '', `${window.location.pathname}?${usp.toString()}`);

      const randomFunction = Math.random;
      Math.random = () => 0; // to select the sample

      sampleRUM();

      Math.random = randomFunction;

      assert.strictEqual(window.hlx.rum.weight, 10);
      assert.strictEqual(window.hlx.rum.isSelected, true);
    });

    it('optel=low enables RUM with weight 1000', () => {
      const usp = new URLSearchParams(window.location.search);
      usp.append('optel', 'low');
      window.history.replaceState({}, '', `${window.location.pathname}?${usp.toString()}`);
      const randomFunction = Math.random;
      Math.random = () => 0; // to select the sample

      sampleRUM();

      Math.random = randomFunction;

      assert.strictEqual(window.hlx.rum.weight, 1000);
    });
  });

  describe('optel parameter - disabled state', () => {
    it('optel=off disables RUM with weight 0', () => {
      const usp = new URLSearchParams(window.location.search);
      usp.append('optel', 'off');
      window.history.replaceState({}, '', `${window.location.pathname}?${usp.toString()}`);

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
      assert.strictEqual(window.hlx.rum.weight, 0);
      assert.strictEqual(window.hlx.rum.isSelected, false);
      // eslint-disable-next-line no-underscore-dangle
      navigator.sendBeacon = navigator._sendBeacon;
    });
  });

  describe('rum parameter takes precedence over optel', () => {
    it('rum=on overrides optel=off', () => {
      const usp = new URLSearchParams(window.location.search);
      usp.append('rum', 'on');
      usp.append('optel', 'off');
      window.history.replaceState({}, '', `${window.location.pathname}?${usp.toString()}`);

      const sendBeaconArgs = {};
      // eslint-disable-next-line no-underscore-dangle
      navigator._sendBeacon = navigator.sendBeacon;
      navigator.sendBeacon = (url, data) => {
        sendBeaconArgs.url = url;
        sendBeaconArgs.data = JSON.parse(data);
        return true;
      };

      sampleRUM();

      assert.strictEqual(sendBeaconArgs.data.weight, 1);
      assert.strictEqual(window.hlx.rum.isSelected, true);
      // eslint-disable-next-line no-underscore-dangle
      navigator.sendBeacon = navigator._sendBeacon;
    });

    it('rum=off overrides optel=on', () => {
      const usp = new URLSearchParams(window.location.search);
      usp.append('rum', 'off');
      usp.append('optel', 'on');
      window.history.replaceState({}, '', `${window.location.pathname}?${usp.toString()}`);

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
      assert.strictEqual(window.hlx.rum.weight, 0);
      assert.strictEqual(window.hlx.rum.isSelected, false);
      // eslint-disable-next-line no-underscore-dangle
      navigator.sendBeacon = navigator._sendBeacon;
    });

    it('rum=high overrides optel=low', () => {
      const usp = new URLSearchParams(window.location.search);
      usp.append('rum', 'high');
      usp.append('optel', 'low');
      window.history.replaceState({}, '', `${window.location.pathname}?${usp.toString()}`);

      sampleRUM();

      assert.strictEqual(window.hlx.rum.weight, 10);
    });
  });

  describe('default weight when optel has invalid value', () => {
    it('defaults to weight 100 for invalid optel value', () => {
      const usp = new URLSearchParams(window.location.search);
      usp.append('optel', 'invalid');
      window.history.replaceState({}, '', `${window.location.pathname}?${usp.toString()}`);

      sampleRUM();

      assert.strictEqual(window.hlx.rum.weight, 100);
    });
  });
});
