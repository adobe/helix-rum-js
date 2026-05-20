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

describe('sampleRUM - webdriver bot detection', () => {
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
    delete navigator.webdriver;

    const enhancer = document.querySelector('script[src*="rum-enhancer"]');
    if (enhancer) {
      enhancer.remove();
    }
  });

  it('adds ua field with +http://navigator.webdriver when navigator.webdriver is true', () => {
    Object.defineProperty(navigator, 'webdriver', { value: true, configurable: true });

    const sendBeaconArgs = {};
    // eslint-disable-next-line no-underscore-dangle
    navigator._sendBeacon = navigator.sendBeacon;
    navigator.sendBeacon = (url, data) => {
      sendBeaconArgs.url = url;
      sendBeaconArgs.data = JSON.parse(data);
      return true;
    };

    sampleRUM('top', {});

    assert.ok(sendBeaconArgs.data.ua, 'ua field should be present');
    assert.ok(
      sendBeaconArgs.data.ua.includes('+http://navigator.webdriver'),
      'ua should contain +http://navigator.webdriver',
    );
    assert.ok(
      sendBeaconArgs.data.ua.startsWith(navigator.userAgent.split(' +http')[0]),
      'ua should start with the real user agent',
    );
    // eslint-disable-next-line no-underscore-dangle
    navigator.sendBeacon = navigator._sendBeacon;
  });

  it('does not add ua field when navigator.webdriver is false', () => {
    Object.defineProperty(navigator, 'webdriver', { value: false, configurable: true });

    const sendBeaconArgs = {};
    // eslint-disable-next-line no-underscore-dangle
    navigator._sendBeacon = navigator.sendBeacon;
    navigator.sendBeacon = (url, data) => {
      sendBeaconArgs.url = url;
      sendBeaconArgs.data = JSON.parse(data);
      return true;
    };

    sampleRUM('top', {});

    assert.isUndefined(sendBeaconArgs.data.ua, 'ua field should not be present for normal browsers');
    // eslint-disable-next-line no-underscore-dangle
    navigator.sendBeacon = navigator._sendBeacon;
  });

  it('does not add ua field when userAgent already contains +http', () => {
    Object.defineProperty(navigator, 'webdriver', { value: true, configurable: true });
    const originalUA = navigator.userAgent;
    Object.defineProperty(navigator, 'userAgent', {
      value: `${originalUA} +http://some-existing-bot-disclosure`,
      configurable: true,
    });

    const sendBeaconArgs = {};
    // eslint-disable-next-line no-underscore-dangle
    navigator._sendBeacon = navigator.sendBeacon;
    navigator.sendBeacon = (url, data) => {
      sendBeaconArgs.url = url;
      sendBeaconArgs.data = JSON.parse(data);
      return true;
    };

    sampleRUM('top', {});

    assert.isUndefined(sendBeaconArgs.data.ua, 'ua field should not be added when UA already discloses bot via +http');
    // eslint-disable-next-line no-underscore-dangle
    navigator.sendBeacon = navigator._sendBeacon;
    Object.defineProperty(navigator, 'userAgent', { value: originalUA, configurable: true });
  });
});
