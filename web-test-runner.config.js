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
export default {
  coverageConfig: {
    report: true,
    reportDir: 'coverage',
    threshold: {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
    exclude: [
      'test/fixtures/**',
      'node_modules/**',
      'test/micro-loader/rum-standalone.js',
    ],
  },
  files: [
    'test/**/*.test.{html,js}',
  ],
  middleware: [
    async function emulateRUM(context, next) {
      if (context.url.includes('rum-standalone.js')) {
        const requestURL = new URL(context.url, 'http://localhost');
        const delayMs = Number.parseInt(requestURL.searchParams.get('delayms') || '0', 10);
        if (Number.isFinite(delayMs) && delayMs > 0) {
          await new Promise((resolve) => {
            setTimeout(resolve, delayMs);
          });
        }
        await next();
        if (typeof context.body === 'string') {
          context.body = context.body
            .replace(/navigator\.sendBeacon/g, 'fakeSendBeacon');
        } else if (Buffer.isBuffer(context.body)) {
          context.body = context.body.toString()
            .replace(/navigator\.sendBeacon/g, 'fakeSendBeacon');
        }
        return true;
      } else if (context.url.includes('helix-rum-enhancer@')) {
        context.body = '// Mock RUM enhancer - no-op\nconsole.log("RUM enhancer mock loaded");';
        context.set('Content-Type', 'application/javascript');
        return true;
      }
      return next();
    }],
};
