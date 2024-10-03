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

describe('sampleRUM - RUM disabled', () => {
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

    expect(Object.keys(sendBeaconArgs).length).to.equal(0);
    // eslint-disable-next-line no-underscore-dangle
    navigator.sendBeacon = navigator._sendBeacon;
  });

  it('sampleRUM fire custom rum event even if RUM is disabled', (done) => {
    const cb = (event) => {
      document.removeEventListener('rum', cb);

      // in 1/100 of cases, the test will fail because rum will be enabled automatically
      expect(event.detail.checkpoint).to.equal('test');
      expect(event.detail.data.foo).to.equal('bar');
      expect(event.detail.data.int).to.equal(1);
      done();
    };

    document.addEventListener('rum', cb);

    sampleRUM('test', {
      foo: 'bar',
      int: 1,
    });
  });
});
