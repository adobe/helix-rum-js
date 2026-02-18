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

// /* eslint-disable max-classes-per-file */
(function () {
  'use strict';

  /* eslint-env browser */
  function sampleRUM(checkpoint, data) {
    // eslint-disable-next-line max-len
    const timeShift = () => (window.performance ? window.performance.now() : Date.now() - window.hlx.rum.firstReadTime);
    try {
      window.hlx = window.hlx || {};
      if (!window.hlx.rum || !window.hlx.rum.collector) {
        sampleRUM.enhance = () => {};
        const params = new URLSearchParams(window.location.search);
        const { currentScript } = document;
        const rate = params.get('rum') || window.SAMPLE_PAGEVIEWS_AT_RATE
          || params.get('optel') || (currentScript && currentScript.dataset.rate);
        const rateValue = {
          on: 1,
          off: 0,
          high: 10,
          low: 1000,
        }[rate];
        const weight = rateValue !== undefined ? rateValue : 100;
        const id = (window.hlx.rum && window.hlx.rum.id)
          || crypto.randomUUID().slice(-9);
        const isSelected = (window.hlx.rum && window.hlx.rum.isSelected)
          || (weight > 0 && Math.random() * weight < 1);
        // eslint-disable-next-line object-curly-newline, max-len
        window.hlx.rum = { weight, id, isSelected, firstReadTime: window.performance ? window.performance.timeOrigin : Date.now(), sampleRUM, queue: [], collector: (...args) => window.hlx.rum.queue.push(args) };
        if (isSelected) {
          const dataFromErrorObj = (error) => {
            const errData = { source: 'undefined error' };
            try {
              errData.target = error.toString();
              if (error.stack) {
                errData.source = error.stack.split('\n')
                  .filter((line) => line.match(/https?:\/\//)).shift()
                  .replace(/at ([^ ]+) \((.+)\)/, '$1@$2')
                  .replace(/ at /, '@')
                  .trim();
              }
            } catch (err) { /* error structure was not as expected */ }
            return errData;
          };

          window.addEventListener('error', ({ error }) => {
            const errData = dataFromErrorObj(error);
            sampleRUM('error', errData);
          });

          window.addEventListener('unhandledrejection', ({ reason }) => {
            let errData = {
              source: 'Unhandled Rejection',
              target: reason || 'Unknown',
            };
            if (reason instanceof Error) {
              errData = dataFromErrorObj(reason);
            }
            sampleRUM('error', errData);
          });

          window.addEventListener('securitypolicyviolation', (e) => {
            if (e.blockedURI.includes('helix-rum-enhancer') && e.disposition === 'enforce') {
              const errData = {
                source: 'csp',
                target: e.blockedURI,
              };
              sampleRUM.sendPing('error', timeShift(), errData);
            }
          });

          sampleRUM.baseURL = sampleRUM.baseURL || new URL(window.RUM_BASE || '/', new URL('https://rum.hlx.page'));
          sampleRUM.collectBaseURL = sampleRUM.collectBaseURL || sampleRUM.baseURL;
          sampleRUM.sendPing = (ck, time, pingData = {}) => {
            // eslint-disable-next-line max-len, object-curly-newline
            const rumData = JSON.stringify({ weight, id, referer: window.location.href, checkpoint: ck, t: time, ...pingData });
            const urlParams = window.RUM_PARAMS ? (new URLSearchParams(window.RUM_PARAMS).toString() || '') : '';
            const { href: url, origin } = new URL(`.rum/${weight}${urlParams ? `?${urlParams}` : ''}`, sampleRUM.collectBaseURL);
            const body = origin === window.location.origin ? new Blob([rumData], { type: 'application/json' }) : rumData;
            navigator.sendBeacon(url, body);
            // eslint-disable-next-line no-console
            console.debug(`ping:${ck}`, pingData);
          };
          sampleRUM.sendPing('top', timeShift());

          sampleRUM.enhance = () => {
            // only enhance once
            if (document.querySelector('script[src*="rum-enhancer"]')) return;
            const { enhancerVersion, enhancerHash } = sampleRUM.enhancerContext || {};
            const script = document.createElement('script');
            if (enhancerHash) {
              script.integrity = enhancerHash;
              script.setAttribute('crossorigin', 'anonymous');
            }
            script.src = new URL(`.rum/@adobe/helix-rum-enhancer@${enhancerVersion || '^2'}/src/index.js`, sampleRUM.baseURL).href;
            document.head.appendChild(script);
          };
          if (!window.hlx.RUM_MANUAL_ENHANCE) {
            sampleRUM.enhance();
          }
        }
      }
      if (window.hlx.rum && window.hlx.rum.isSelected && checkpoint) {
        window.hlx.rum.collector(checkpoint, data, timeShift());
      }
      document.dispatchEvent(new CustomEvent('rum', { detail: { checkpoint, data } }));
    } catch (error) {
      // something went awry
    }
  }

  try {
    const scriptSrc = (document.currentScript && document.currentScript.src)
      ? new URL(document.currentScript.src, window.location.origin).origin : null;
    // eslint-disable-next-line max-len
    const dataAttrs = (document.currentScript && document.currentScript.dataset) ? document.currentScript.dataset : {};
    const {
      postPath, status, enhancerVersion, enhancerHash, ...scriptParams
    } = dataAttrs;
    const base = scriptSrc && postPath ? new URL(postPath, scriptSrc) : scriptSrc;
    sampleRUM.enhancerContext = { enhancerVersion, enhancerHash };
    window.RUM_BASE = window.RUM_BASE || base;
    window.RUM_PARAMS = window.RUM_PARAMS || scriptParams;

    const [navigation] = (window.performance && window.performance.getEntriesByType('navigation')) || [];
    const is404 = status === '404' || (navigation && navigation.name === window.location.href
      && navigation.responseStatus === 404);

    if (is404) {
      sampleRUM('404', { source: document.referrer });
    } else {
      sampleRUM();
    }
  } catch (error) {
    // something went wrong
  }
}());
