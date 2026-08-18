// ESLint flat config for hinna-swagger-ui (CommonJS Node scripts, no TypeScript).
//
// Rollout posture (mirrors the hinna-e2e L3-01 rollout and the hinna-common-lib
// Spotless rollout): this is the FIRST lint pass over pre-existing files, so
// every rule is downgraded to 'warn'. `npm run lint` therefore exits 0 today —
// CI can wire it up immediately without a mass reformat/fix commit — while
// still printing every finding so the owner can decide which rules to promote
// to 'error' (and clean up the backlog) later.
'use strict';

const js = require('@eslint/js');
const globals = require('globals');

function toWarn(config) {
  const rules = {};
  for (const [rule, severity] of Object.entries(config.rules || {})) {
    const isArray = Array.isArray(severity);
    const level = isArray ? severity[0] : severity;
    if (level === 'error' || level === 2) {
      rules[rule] = isArray ? ['warn', ...severity.slice(1)] : 'warn';
    } else {
      rules[rule] = severity;
    }
  }
  return { ...config, rules };
}

module.exports = [
  toWarn(js.configs.recommended),
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off',
    },
  },
  {
    ignores: ['node_modules/**', 'public/**'],
  },
];
