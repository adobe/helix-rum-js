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
import { expect } from '@esm-bundle/chai';
import { sampleRUM } from '../../src/index.js';

// fires an error on purpose
export function fireError() {
  let s;
  s.t = 1;
}

export async function test(errorFct, sourceTest, targetTest, queue) {
  sampleRUM();

  window.setTimeout(errorFct, 1);

  const wait = async () => new Promise((resolve) => {
    window.setTimeout(() => {
      resolve();
    }, 1500);
  });

  await wait();

  expect(queue.length).to.equal(1);
  const { source, target } = queue[0].data;
  sourceTest.call(this, source);
  targetTest.call(this, target);
}

export function before(config) {
  // eslint-disable-next-line no-param-reassign
  config.queue = [];

  const usp = new URLSearchParams(window.location.search);
  usp.append('rum', 'on');
  window.history.replaceState({}, '', `${window.location.pathname}?${usp.toString()}`);

  // eslint-disable-next-line no-param-reassign
  config.listeners = window.Mocha.process.listeners('uncaughtException');
  window.Mocha.process.removeAllListeners('uncaughtException');
  window.Mocha.process.on('uncaughtException', () => {});

  // eslint-disable-next-line no-underscore-dangle
  navigator._sendBeacon = navigator.sendBeacon;
  navigator.sendBeacon = (url, d) => {
    const data = JSON.parse(d);
    if (data.checkpoint === 'error') {
      config.queue.push({ url, data });
    }
    return true;
  };
}

export function after(config) {
  const usp = new URLSearchParams(window.location.search);
  usp.delete('rum');
  window.history.replaceState({}, '', `${window.location.pathname}?${usp.toString()}`);
  // eslint-disable-next-line no-underscore-dangle
  window.hlx.rum = undefined;

  const enhancer = document.querySelector('script[src*="rum-enhancer"]');
  if (enhancer) {
    enhancer.remove();
  }

  window.Mocha.process.removeAllListeners('uncaughtException');
  window.Mocha.process.removeAllListeners('error');

  config.listeners.forEach((lst) => {
    window.Mocha.process.addListener('uncaughtException', lst);
  });
  // eslint-disable-next-line no-param-reassign
  config.listeners = undefined;
  // eslint-disable-next-line no-underscore-dangle
  navigator.sendBeacon = navigator._sendBeacon;
  // eslint-disable-next-line no-param-reassign, no-unused-vars
  config.queue = [];
}
