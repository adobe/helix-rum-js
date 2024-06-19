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
/* eslint-env browser */
export function sampleRUM(checkpoint, data) {
  // eslint-disable-next-line max-len
  const timeShift = () => (window.performance ? window.performance.now() : Date.now() - window.hlx.rum.firstReadTime);
  try {
    window.hlx = window.hlx || {};
    if (!window.hlx.rum) {
      const weight = new URLSearchParams(window.location.search).get('rum') === 'on' ? 1 : 100;
      const id = Math.random().toString(36).slice(-4);
      const isSelected = (Math.random() * weight < 1);
      // eslint-disable-next-line object-curly-newline, max-len
      window.hlx.rum = { weight, id, isSelected, firstReadTime: window.performance ? window.performance.timeOrigin : Date.now(), sampleRUM, queue: [], collector: (...args) => window.hlx.rum.queue.push(args) };
      if (isSelected) {
        ['error', 'unhandledrejection'].forEach((event) => {
          window.addEventListener(event, ({ reason, error }) => {
            const errData = { source: 'undefined error' };
            try {
              errData.target = (reason || error).toString();
              errData.source = (reason || error).stack.split('\n')
                .filter((line) => line.match(/https?:\/\//)).shift()
                .replace(/at ([^ ]+) \((.+)\)/, '$1@$2')
                .trim();
            } catch (err) { /* error structure was not as expected */ }
            sampleRUM('error', errData);
          });
        });
        sampleRUM.baseURL = sampleRUM.baseURL || new URL(window.RUM_BASE || '/', new URL('https://rum.hlx.page'));
        sampleRUM.collectBaseURL = sampleRUM.collectBaseURL || sampleRUM.baseURL;
        sampleRUM.sendPing = (ck, time, pingData = {}) => {
          // eslint-disable-next-line max-len, object-curly-newline
          const rumData = JSON.stringify({ weight, id, referer: window.location.href, checkpoint: ck, t: time, ...pingData });
          const { href: url, origin } = new URL(`.rum/${weight}`, sampleRUM.collectBaseURL);
          const body = origin === window.location.origin ? new Blob([rumData], { type: 'application/json' }) : rumData;
          navigator.sendBeacon(url, body);
          // eslint-disable-next-line no-console
          console.debug(`ping:${ck}`, pingData);
        };
        sampleRUM.sendPing('top', timeShift());

        const loadEnhancer = () => {
          const script = document.createElement('script');
          script.src = new URL('.rum/@adobe/helix-rum-enhancer@^2/src/index.js', sampleRUM.baseURL).href;
          document.head.appendChild(script);
        };

        if (window.performance && window.performance.getEntriesByType('navigation').every((e) => e.loadEventEnd)) {
          // load event already ended
          loadEnhancer();
        } else {
          window.addEventListener('load', loadEnhancer);
        }
      }
    }
    if (window.hlx.rum && window.hlx.rum.isSelected && checkpoint) {
      window.hlx.rum.collector(checkpoint, data, timeShift());
    }
    document.dispatchEvent(new CustomEvent('rum', { detail: { checkpoint, data } }));
  } catch (error) {
    // something went wrong
  }
}
