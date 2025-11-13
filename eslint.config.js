import { defineConfig, globalIgnores } from '@eslint/config-helpers'
import { recommended, source, test } from '@adobe/eslint-config-helix';
import globals from "globals";

export default defineConfig([
  globalIgnores([
    '.vscode/*',
    'coverage/*',
    '*/micro.js',
    'dist/*',
    'test/micro-loader/rum-standalone.js',
  ]), {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.mocha,
      },
    },
  rules: {
    'import/no-extraneous-dependencies': ['error', {
      devDependencies: [
          '**/test/**',
          'rollup.config.js',
          'web-test-runner.config.js',
          'eslint.config.js',
      ],
    }],
    },
    plugins: {
      import: recommended.plugins.import,
    },
    extends: [recommended],
  },
  source,
  test,
]);
