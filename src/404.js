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
import { sampleRUM } from './index.js';

try {
  const scriptSrc = (document.currentScript && document.currentScript.src)
    ? new URL(document.currentScript.src, window.location.origin).origin : null;
  const scriptParams = (document.currentScript && document.currentScript.dataset)
    ? document.currentScript.dataset : null;
  window.RUM_BASE = window.RUM_BASE || scriptSrc;
  window.RUM_PARAMS = window.RUM_PARAMS || scriptParams;
  sampleRUM('404', { source: document.referrer });
} catch (error) {
  // something went wrong
}