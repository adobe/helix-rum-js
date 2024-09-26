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
      sampleRUM.enhance = () => {};
      if (!window.hlx.rum) {
        const weight = (window.SAMPLE_PAGEVIEWS_AT_RATE === 'high' && 10)
          || (window.SAMPLE_PAGEVIEWS_AT_RATE === 'low' && 1000)
          || (new URLSearchParams(window.location.search).get('rum') === 'on' && 1)
          || 100;
        const id = Math.random().toString(36).slice(-4);
        const isSelected = (Math.random() * weight < 1);
        // eslint-disable-next-line object-curly-newline, max-len
        window.hlx.rum = { weight, id, isSelected, firstReadTime: window.performance ? window.performance.timeOrigin : Date.now(), sampleRUM, queue: [], collector: (...args) => window.hlx.rum.queue.push(args) };
        if (isSelected) {
          const dataFromErrorObj = (error) => {
            const errData = { source: 'undefined error' };
            try {
              errData.target = error.toString();
              errData.source = error.stack.split('\n')
                .filter((line) => line.match(/https?:\/\//)).shift()
                .replace(/at ([^ ]+) \((.+)\)/, '$1@$2')
                .replace(/ at /, '@')
                .trim();
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

          sampleRUM.baseURL = sampleRUM.baseURL || new URL(window.RUM_BASE || '/', new URL('https://rum.hlx.page'));
          sampleRUM.collectBaseURL = sampleRUM.collectBaseURL || sampleRUM.baseURL;
          sampleRUM.sendPing = (ck, time, pingData = {}) => {
            // eslint-disable-next-line max-len, object-curly-newline
            const rumData = JSON.stringify({ weight, id, referer: window.location.href, checkpoint: ck, t: time, ...pingData });
            const urlParams = window.RUM_PARAMS ? `?${new URLSearchParams(window.RUM_PARAMS).toString()}` : '';
            const { href: url, origin } = new URL(`.rum/${weight}${urlParams}`, sampleRUM.collectBaseURL);
            const body = origin === window.location.origin ? new Blob([rumData], { type: 'application/json' }) : rumData;
            navigator.sendBeacon(url, body);
            // eslint-disable-next-line no-console
            console.debug(`ping:${ck}`, pingData);
          };
          sampleRUM.sendPing('top', timeShift());

          sampleRUM.enhance = () => {
            const script = document.createElement('script');
            script.src = new URL('.rum/@adobe/helix-rum-enhancer@^2/src/index.js', sampleRUM.baseURL).href;
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
    const scriptParams = (document.currentScript && document.currentScript.dataset)
      ? document.currentScript.dataset : null;
    window.RUM_BASE = window.RUM_BASE || scriptSrc;
    window.RUM_PARAMS = window.RUM_PARAMS || scriptParams;

    sampleRUM();
  } catch (error) {
    // something went wrong
  }
}());
