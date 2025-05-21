/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* eslint-disable */
(function () {
  console.log('standalone.js loaded', document.currentScript.outerHTML);
  navigator.sendBeacon('https://rum.hlx.page/.rum/1?program=pXXXXXX&environment=eYYYYYY', '{"checkpoint":"top", "id":"superfake"}');

  window.WAS_SELECTED = window.hlx.rum.isSelected;
}());
// this file is a poor imitation of our dist/standalone.js
// but it is useful to verify that the script is indeed loaded
// with the correct parameters