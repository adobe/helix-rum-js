/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
window.fakeSendBeacon = () => true;
window.testTimeline = window.testTimeline || {};

document.addEventListener('DOMContentLoaded', () => {
  window.testTimeline.domContentLoaded = performance.now();
});

window.addEventListener('load', () => {
  const [navigation] = performance.getEntriesByType('navigation');
  const rum = performance.getEntriesByType('resource')
    .find((entry) => entry.name.includes('rum-standalone.js'));
  const rumScript = document.querySelector('script[data-test-rum]');
  window.testTimeline.loadNow = performance.now();

  window.testTimeline.nav = navigation ? {
    domContentLoadedEventEnd: navigation.domContentLoadedEventEnd,
    loadEventEnd: navigation.loadEventEnd,
  } : null;
  window.testTimeline.rum = rum ? {
    name: rum.name,
    startTime: rum.startTime,
    responseEnd: rum.responseEnd,
    duration: rum.duration,
  } : null;
  window.testTimeline.rumAttrs = rumScript ? {
    defer: rumScript.hasAttribute('defer'),
    async: rumScript.hasAttribute('async'),
  } : null;
  window.testTimeline.complete = true;
});
