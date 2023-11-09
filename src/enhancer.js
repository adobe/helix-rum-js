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
/* eslint-env browser */
const KNOWN_PROPERTIES = ['weight', 'id', 'referer', 'checkpoint', 't', 'source', 'target', 'cwv', 'CLS', 'FID', 'LCP', 'INP', 'TTFB'];
const SESSION_STORAGE_KEY = 'aem-rum';
const urlSanitizers = {
  full: () => window.location.href,
  origin: () => window.location.origin,
  path: () => window.location.href.replace(/\?.*$/, ''),
};
const { sampleRUM, queue, isSelected } = window.hlx.rum;
let left = false;

const targetselector = (element) => {
  let value = element.getAttribute('href') || element.currentSrc || element.getAttribute('src')
                || element.dataset.action || element.action;
  if (value && value.startsWith('https://')) {
    // resolve relative links
    value = new URL(value, window.location).href;
  }
  return value;
};

const sourceselector = (element) => {
  if (element === document.body || element === document.documentElement || !element) {
    return undefined;
  }

  const form = element.closest('form');
  let formElementSelector = '';
  if (form && Array.from(form.elements).includes(element)) {
    formElementSelector = element.tagName === 'INPUT' ? `form input[type='${element.getAttribute('type')}']` : `form ${element.tagName.toLowerCase()}`;
  }

  if (element.id || formElementSelector) {
    const blockName = element.closest('.block') ? element.closest('.block').getAttribute('data-block-name') : '';
    const id = element.id ? `#${element.id}` : '';
    return blockName ? `.${blockName} ${formElementSelector}${id}` : `${formElementSelector}${id}`;
  }

  if (element.getAttribute('data-block-name')) {
    return `.${element.getAttribute('data-block-name')}`;
  }
  return sourceselector(element.parentElement);
};

// eslint-disable-next-line no-unused-vars
function optedIn(checkpoint, data) {
  // TODO: check config service to know if
  return true;
}

export function trackCheckpoint(checkpoint, data, t) {
  const { weight, id } = window.hlx.rum;
  if (optedIn(checkpoint, data) && isSelected) {
    const sendPing = (pdata = data) => {
      // eslint-disable-next-line object-curly-newline, max-len
      const body = JSON.stringify({ weight, id, sanitizeURL: urlSanitizers[window.hlx.RUM_MASK_URL || 'path'], checkpoint, t, ...data }, KNOWN_PROPERTIES);
      const url = new URL(`.rum/${weight}`, sampleRUM.baseURL).href;
      navigator.sendBeacon(url, body);
      // eslint-disable-next-line no-console
      console.debug(`ping:${checkpoint}`, pdata);
    };
    sendPing(data);
  }
}

function processQueue() {
  while (queue.length) {
    const { checkpoint, t, data } = queue.shift();
    trackCheckpoint(checkpoint, t, data);
  }
}

function addCWVTracking() {
  setTimeout(() => {
    const cwvScript = new URL('.rum/web-vitals/dist/web-vitals.iife.js', sampleRUM.baseURL).href;
    if (document.querySelector(`script[src="${cwvScript}"]`)) {
      // web vitals script has been loaded already
      return;
    }
    const script = document.createElement('script');
    script.src = cwvScript;
    script.onload = () => {
      const storeCWV = (measurement) => {
        const data = { cwv: {} };
        data.cwv[measurement.name] = measurement.value;
        sampleRUM('cwv', data);
      };
      // When loading `web-vitals` using a classic script, all the public
      // methods can be found on the `webVitals` global namespace.
      ['CLS', 'FID', 'LCP', 'INP', 'TTFB']
        .map((metric) => window.webVitals[`get${metric}`])
        .filter((metric) => typeof metric === 'function')
        .forEach((invokeMetric) => {
          invokeMetric(storeCWV);
        });
    };
    document.head.appendChild(script);
  }, 2000); // wait for delayed
}

function addEnterLeaveTracking() {
  // enter checkpoint when referrer is not the current page url
  if (!!document.referrer && (document.referrer !== window.location.href)) {
    sampleRUM('enter', { target: undefined, source: document.referrer });
  }
  const leave = ((event) => {
    if (left || (event.type === 'visibilitychange' && document.visibilityState !== 'hidden')) {
      return;
    }
    left = true;
    sampleRUM('leave');
  });
  window.addEventListener('visibilitychange', ((event) => leave(event)));
  window.addEventListener('pagehide', ((event) => leave(event)));
}

function addLoadResourceTracking() {
  if (window.location.hostname === 'blog.adobe.com') {
    const observer = new PerformanceObserver((list) => {
      list.getEntries()
        .filter((entry) => !entry.responseStatus || entry.responseStatus < 400)
        .filter((entry) => window.location.hostname === new URL(entry.name).hostname)
        .filter((entry) => new URL(entry.name).pathname.match('.*(\\.plain\\.html|\\.json)$'))
        .forEach((entry) => {
          sampleRUM('loadresource', { source: entry.name, target: Math.round(entry.duration) });
        });
    });
    observer.observe({ type: 'resource', buffered: true });
  }
}

function addObserveBlockTracking() {
  if (window.IntersectionObserver) {
    const blockobserver = new IntersectionObserver((entries) => {
      entries
        .filter((entry) => entry.isIntersecting)
        .forEach((entry) => {
          sampleRUM.blockobserver.unobserve(entry.target); // observe only once
          const target = targetselector(entry.target);
          const source = sourceselector(entry.target);
          sampleRUM('viewblock', { target, source });
        });
    }, { threshold: 0.25 });
    blockobserver.observe(window.document.querySelectorAll('div[data-block-name]'));
  }
}

function addObserveMediaTracking() {
  if (window.IntersectionObserver) {
    const mediaobserver = new IntersectionObserver((entries) => {
      entries
        .filter((entry) => entry.isIntersecting)
        .forEach((entry) => {
          sampleRUM.mediaobserver.unobserve(entry.target); // observe only once
          const target = targetselector(entry.target);
          const source = sourceselector(entry.target);
          sampleRUM('viewmedia', { target, source });
        });
    }, { threshold: 0.25 });
    mediaobserver.observe(window.document.querySelectorAll('picture > img'));
  }
}

function addTrackingFromConfig() {
  // configured collection should come from config service
  const collectConfig = ['click', 'cwv', 'form', 'enterleave', 'loadresource', 'observeblock', 'observemedia'];
  const trackingFunctions = {
    click: () => {
      document.addEventListener('click', (event) => {
        sampleRUM('click', { target: targetselector(event.target), source: sourceselector(event.target) });
      });
    },
    cwv: () => addCWVTracking(),
    form: () => {
      document.querySelectorAll('form').forEach((form) => {
        form.addEventListener('submit', (event) => {
          sampleRUM('formsubmit', { target: targetselector(event.target), source: sourceselector(event.target) });
        });
      });
    },
    enterleave: () => addEnterLeaveTracking(),
    loadresource: () => addLoadResourceTracking(),
    observeblock: () => addObserveBlockTracking(),
    observemedia: () => addObserveMediaTracking(),
  };

  collectConfig.filter((ck) => trackingFunctions[ck])
    .forEach((ck) => trackingFunctions[ck]());
}

function initEnhancer() {
  // eslint-disable-next-line max-len
  const rumStorage = sessionStorage.getItem(SESSION_STORAGE_KEY) ? JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY)) : {};
  trackCheckpoint('pagesviewed', { source: rumStorage.pages }, 0);
  addTrackingFromConfig();
  window.hlx.rum.collector = trackCheckpoint;
  processQueue();
}

initEnhancer();
