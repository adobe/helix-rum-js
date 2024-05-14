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
  it('rum error selected', async () => {
    const listeners = window.Mocha.process.listeners('uncaughtException');
    window.Mocha.process.removeAllListeners('uncaughtException');
    window.Mocha.process.on('uncaughtException', (err) => {
      console.log('Expected uncaught Exception ', err);
    });
    // eslint-disable-next-line no-underscore-dangle
    navigator._sendBeacon = navigator.sendBeacon;
    navigator.sendBeacon = (url, data) => {
      if (data && JSON.parse(data).checkpoint === 'top') {
        try {
          throw new Error('Expected error');
        } catch (error) {
          window.dispatchEvent(
            new ErrorEvent(
              'error',
              {
                error,
                message: 'Force error to test error handler!',
                lineno: 999,
                filename: 'sampleRUM.test.js',
                cancelable: true,
              },
            ),
          );
        }
      }
      return true;
    };
    sampleRUM();
    expect(window.hlx.rum.queue.length).to.equal(1);
    expect(window.hlx.rum.queue.pop()[0]).to.equal('error');
    // eslint-disable-next-line no-underscore-dangle
    navigator.sendBeacon = navigator._sendBeacon;
    listeners.forEach((lst) => {
      window.Mocha.process.addListener('uncaughtException', lst);
    });
  });
  it('rum capture exception', async () => {
    sampleRUM();
    window.hlx.rum.queue = undefined;
    expect(() => sampleRUM('triggererror')).to.not.throw(Error);
  });
});
