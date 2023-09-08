/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* eslint-env browser */

const rumHandler = {
  defers: {},
  defercalls: [],
  get(target, prop) {
    if (prop === 'always') {
      target.loadEnhancer();
    }
    // eslint-disable-next-line no-prototype-builtins
    if (target.hasOwnProperty(prop)) {
      return target[prop];
    }
    if (this.defers[prop]) {
      return this.defers[prop];
    }
    if (prop === 'drain') {
      return (...args) => this.drain(target, args[0], args[1]);
    }
    this.defers[prop] = (...deferargs) => {
      this.defercalls.push([prop, deferargs]);
    };
    return this.defers[prop];
  },
  set(target, prop, value) {
    const ret = Reflect.set(target, prop, value);
    if (typeof value === 'function') {
      this.drain(target, prop);
    }
    return ret;
  },

  drain(target, fnname) {
    this.defercalls
      .map((defercall) => ({ name: defercall[0], callargs: defercall[1] }))
      .filter(({ name }) => name === fnname)
      .forEach(({ name, callargs }) => target[name](...callargs));
  },
};

/**
 * log RUM if part of the sample.
 * @param {string} checkpoint identifies the checkpoint in funnel
 * @param {Object} data additional data for RUM sample
 * @param {string} data.source DOM node that is the source of a checkpoint event,
 * identified by #id or .classname
 * @param {string} data.target subject of the checkpoint event,
 * for instance the href of a link, or a search term
 */
// eslint-disable-next-line no-use-before-define
export const sampleRUM = new Proxy(internalSampleRUM, rumHandler);

function internalSampleRUM(checkpoint, data = {}) {
  internalSampleRUM.always = internalSampleRUM.always || [];
  internalSampleRUM.always.on = (chkpnt, fn) => {
    internalSampleRUM.always[chkpnt] = fn;
  };
  internalSampleRUM.on = (chkpnt, fn) => {
    internalSampleRUM.cases[chkpnt] = fn;
  };
  internalSampleRUM.loadEnhancer = () => {
    if (internalSampleRUM.enhancerLoaded) {
      return false;
    }
    internalSampleRUM.enhancerLoaded = true;
    // use classic script to avoid CORS issues
    const script = document.createElement('script');
    script.src = 'https://rum.hlx.page/.rum/@adobe/helix-rum-enhancer@^1/src/index.js';
    document.head.appendChild(script);
    return true;
  };

  try {
    window.hlx = window.hlx || {};
    if (!window.hlx.rum) {
      const usp = new URLSearchParams(window.location.search);
      const weight = (usp.get('rum') === 'on') ? 1 : 100; // with parameter, weight is 1. Defaults to 100.
      const id = Array.from({ length: 75 }, (_, i) => String.fromCharCode(48 + i)).filter((a) => /\d|[A-Z]/i.test(a)).filter(() => Math.random() * 75 > 70).join('');
      const random = Math.random();
      const isSelected = (random * weight < 1);
      const firstReadTime = Date.now();
      const urlSanitizers = {
        full: () => window.location.href,
        origin: () => window.location.origin,
        path: () => window.location.href.replace(/\?.*$/, ''),
      };
      // eslint-disable-next-line object-curly-newline, max-len
      window.hlx.rum = { weight, id, random, isSelected, firstReadTime, sampleRUM, sanitizeURL: urlSanitizers[window.hlx.RUM_MASK_URL || 'path'] };
    }
    const { weight, id, firstReadTime } = window.hlx.rum;
    if (window.hlx && window.hlx.rum && window.hlx.rum.isSelected) {
      const knownProperties = ['weight', 'id', 'referer', 'checkpoint', 't', 'source', 'target', 'cwv'];
      const sendPing = (pdata = data) => {
        // eslint-disable-next-line object-curly-newline, max-len, no-use-before-define
        const body = JSON.stringify({ weight, id, referer: window.hlx.rum.sanitizeURL(), checkpoint, t: (Date.now() - firstReadTime), ...data }, knownProperties);
        const url = `https://rum.hlx.page/.rum/${weight}`;
        // eslint-disable-next-line no-unused-expressions
        navigator.sendBeacon(url, body);
        // eslint-disable-next-line no-console
        console.debug(`ping:${checkpoint}`, pdata);
      };
      internalSampleRUM.cases = internalSampleRUM.cases || {
        cwv: () => sampleRUM.cwv(data) || true,
        lazy: () => internalSampleRUM.loadEnhancer(),
      };
      sendPing(data);
      if (internalSampleRUM.cases[checkpoint]) {
        internalSampleRUM.cases[checkpoint]();
      }
    }
    if (internalSampleRUM.always[checkpoint]) {
      internalSampleRUM.always[checkpoint](data);
    }
  } catch (error) {
    // something went wrong
  }
}
