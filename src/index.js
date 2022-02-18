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


/**
 * log RUM if part of the sample.
 * @param {string} checkpoint identifies the checkpoint in funnel
 * @param {Object} data additional data for RUM sample
 * @param {string} data.source DOM node that is the source of a checkpoint event, identified by #id or .classname
 * @param {string} data.target subject of the checkpoint event, for instance the href of a link, or a search term
 */
 export function sampleRUM(checkpoint, data = {}) {
  try {
    window.hlx = window.hlx || {};
    if (!window.hlx.rum) {
      const usp = new URLSearchParams(window.location.search);
      const weight = (usp.get('rum') === 'on') ? 1 : 100; // with parameter, weight is 1. Defaults to 100.
      // eslint-disable-next-line no-bitwise
      const hashCode = (s) => s.split('').reduce((a, b) => (((a << 5) - a) + b.charCodeAt(0)) | 0, 0);
      const id = `${hashCode(window.location.href)}-${new Date().getTime()}-${Math.random().toString(16).substr(2, 14)}`;
      const random = Math.random();
      const isSelected = (random * weight < 1);
      // eslint-disable-next-line object-curly-newline
      window.hlx.rum = { weight, id, random, isSelected };
    }
    const { random, weight, id } = window.hlx.rum;
    if (random && (random * weight < 1)) {
      const sendPing = () => {
        // eslint-disable-next-line object-curly-newline, max-len, no-use-before-define
        const body = JSON.stringify({ weight, id, referer: window.location.href, generation: RUM_GENERATION || '__HELIX_RUM_JS_VERSION__', checkpoint, ...data });
        const url = `https://rum.hlx3.page/.rum/${weight}`;
        // eslint-disable-next-line no-unused-expressions
        navigator.sendBeacon(url, body);
      };
      sendPing();
      // special case CWV
      if (checkpoint === 'cwv') {
        // use classic script to avoid CORS issues
        const script = document.createElement('script');
        script.src = 'https://rum.hlx3.page/.rum/web-vitals/dist/web-vitals.iife.js';
        script.onload = () => {
          const storeCWV = (measurement) => {
            data.cwv = {};
            data.cwv[measurement.name] = measurement.value;
            sendPing();
          };
            // When loading `web-vitals` using a classic script, all the public
            // methods can be found on the `webVitals` global namespace.
          window.webVitals.getCLS(storeCWV);
          window.webVitals.getFID(storeCWV);
          window.webVitals.getLCP(storeCWV);
        };
        document.head.appendChild(script);
      }
    }
  } catch (e) {
    // something went wrong
  }
}
