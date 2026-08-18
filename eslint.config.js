'use strict';

const js = require('@eslint/js');

/**
 * Lint policy (ticket L3-03): this repo is a plain Node.js/CommonJS script
 * collection (scripts/*.js), not a framework app — so the config is scoped
 * to that directory rather than guessing at a broader source layout.
 *
 * `public/` is excluded on purpose: it holds the served OpenAPI spec and
 * static viewer HTML, not authored JS, and this policy must not touch API
 * spec content.
 */
module.exports = [
  js.configs.recommended,
  {
    files: ['scripts/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        require: 'readonly',
        module: 'readonly',
        exports: 'writable',
        process: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    ignores: ['node_modules/**', 'public/**', 'docs/**'],
  },
];
