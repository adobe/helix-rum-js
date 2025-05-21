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
const c = document.currentScript;
const d = c.dataset;
const q = new URLSearchParams(location.search);
const v = q.get('rum') || q.get('optel') || d.rate;
const w = { on: 1, off: 0, high: 10, low: 1e3 }[v] || 100;
const r = (window.hlx = window.hlx || {}).rum || (window.hlx.rum = { id: crypto.randomUUID().slice(-9) });
if (r.isSelected || (w && Math.random() * w < 1)) {
  const n = document.createElement('script');
  for (const a of c.attributes) n.setAttribute(a.name, a.value);
  n.src = c.src.replace(/micro.js$/, 'standalone.js');
  n.defer = 'defer';
  document.head.append(n);
}
