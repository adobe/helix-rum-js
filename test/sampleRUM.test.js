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

import { expect } from '@esm-bundle/chai';
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
  });

  it('rum initialization', async () => {
    const sendBeaconArgs = {};
    // eslint-disable-next-line no-underscore-dangle
    navigator._sendBeacon = navigator.sendBeacon;
    navigator.sendBeacon = (url, data) => {
      sendBeaconArgs.url = url;
      sendBeaconArgs.data = JSON.parse(data);
      return true;
    };
    sampleRUM();
    expect(sendBeaconArgs.url).to.equal('https://rum.hlx.page/.rum/1');
    expect(sendBeaconArgs.data.id).to.exist;
    expect(sendBeaconArgs.data.weight).to.equal(1);
    expect(sendBeaconArgs.data.checkpoint).to.equal('top');
    // eslint-disable-next-line no-underscore-dangle
    navigator.sendBeacon = navigator._sendBeacon;
  });

  it('rum checkpoint queuing', async () => {
    sampleRUM();
    sampleRUM('test', {
      foo: 'bar',
      int: 1,
    });
    const [checkpoint, data, time] = window.hlx.rum.queue.pop();
    expect(checkpoint).to.equal('test');
    expect(data.foo).to.equal('bar');
    expect(data.int).to.equal(1);
    expect(time).to.exist;
  });

  it('rum initialization not selected', async () => {
    const sendBeaconArgs = {};
    // eslint-disable-next-line no-underscore-dangle
    navigator._sendBeacon = navigator.sendBeacon;
    navigator.sendBeacon = (url, data) => {
      sendBeaconArgs.url = url;
      sendBeaconArgs.data = JSON.parse(data);
      return true;
    };
    const usp = new URLSearchParams(window.location.search);
    usp.delete('rum');
    window.history.replaceState({}, '', `${window.location.pathname}?${usp.toString()}`);
    window.hlx.rum = undefined;
    sampleRUM();
    expect(Object.keys(sendBeaconArgs).length).to.equal(0);
    // eslint-disable-next-line no-underscore-dangle
    navigator.sendBeacon = navigator._sendBeacon;
  });

  it('rum checkpoint queuing not selected', async () => {
    sampleRUM();
    window.hlx.rum.isSelected = false;
    sampleRUM('test', {
      foo: 'bar',
      int: 1,
    });
    expect(window.hlx.rum.queue.length).to.equal(0);
  });
});
