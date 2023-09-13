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
  });

  it('basic rum sampling', async () => {
    const sendBeaconArgs = {};

    // eslint-disable-next-line no-underscore-dangle
    navigator._sendBeacon = navigator.sendBeacon;
    navigator.sendBeacon = (url, data) => {
      sendBeaconArgs.url = url;
      sendBeaconArgs.data = JSON.parse(data);
      return true;
    };

    sampleRUM('test', {
      foo: 'bar',
      int: 1,
      bool: true,
      obj: { foo: 'bar' },
      arr: ['foo', 'bar'],
    });

    console.log('sendBeaconArgs.data', sendBeaconArgs.data);
    expect(sendBeaconArgs.url).to.equal('https://rum.hlx.page/.rum/1');
    expect(sendBeaconArgs.data.id).to.exist;
    expect(sendBeaconArgs.data.weight).to.equal(1);
    expect(sendBeaconArgs.data.checkpoint).to.equal('test');
    // expect(sendBeaconArgs.data.foo).to.equal('bar');
    // expect(sendBeaconArgs.data.int).to.equal(1);
    // expect(sendBeaconArgs.data.bool).to.equal(true);
    // expect(sendBeaconArgs.data.obj).to.deep.equal({ foo: 'bar' });
    // expect(sendBeaconArgs.data.arr).to.deep.equal(['foo', 'bar']);

    // eslint-disable-next-line no-underscore-dangle
    navigator.sendBeacon = navigator._sendBeacon;
  });
});
