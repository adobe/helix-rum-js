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

import cleanup from 'rollup-plugin-cleanup';
import eslint from 'rollup-plugin-eslint-bundle';
import pkg from '@trieloff/rollup-plugin-checksum';

const checksum = pkg.default;

const banner = `/*
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

// /* eslint-disable max-classes-per-file */`;

const bundles = [
  {
    source: 'src/standalone.js',
    outputFile: 'dist/rum-standalone',
  },
  {
    source: 'src/404.js',
    outputFile: 'dist/rum-standalone-404',
  },
];

export default [...bundles.map(({ outputFile, source }) => ({
  input: source,
  output: [
    {
      file: `${outputFile}.js`,
      format: 'iife',
      sourcemap: false,
      exports: 'auto',
      banner,
    },
  ].filter((m) => m),
  plugins: [
    cleanup({
      comments: ['eslint', 'jsdoc', /^\//, /^\*(?!\sc8\s)(?!\n \* Copyright)/],
      maxEmptyLines: -1,
    }),
    eslint({
      eslintOptions: {
        fix: true,
      },
    }),
    checksum({
      filename: `${outputFile.split('/').pop()}.md5`,
      includeAssets: false,
    }),
    checksum({
      filename: `${outputFile.split('/').pop()}`,
      includeAssets: false,
      sri: 'sha384',
    }),
  ],
}))];
