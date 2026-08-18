#!/usr/bin/env node

/**
 * L3-03: single entry point for this repo's lint/format/dependency policy.
 *
 * Run with: npm run check
 *
 * Exit codes:
 *   0 — lint, format, and dependency checks all passed
 *   1 — one or more of the checks found real violations
 *   2 — the check itself is broken (e.g. the file glob matched nothing;
 *       a check over zero files is a vacuous pass, so this script treats
 *       that as an error, never a success)
 *
 * Deliberately NOT included: auto-fixing or reformatting existing files.
 * This script only reports; see the README "Code quality policy" section
 * for how to fix what it finds.
 */

const path = require('path');
const fs = require('fs');
const { ESLint } = require('eslint');
const prettier = require('prettier');

const REPO_ROOT = path.resolve(__dirname, '..');
const LINT_GLOB = 'scripts/**/*.js';

async function runLint() {
  const eslint = new ESLint({ cwd: REPO_ROOT });
  const results = await eslint.lintFiles([LINT_GLOB]);

  const errorCount = results.reduce((sum, r) => sum + r.errorCount, 0);
  const warningCount = results.reduce((sum, r) => sum + r.warningCount, 0);

  return { checkedFiles: results.map((r) => r.filePath), errorCount, warningCount, results };
}

async function runFormatCheck() {
  const eslint = new ESLint({ cwd: REPO_ROOT });
  const allJsFiles = (await eslint.lintFiles([LINT_GLOB])).map((r) => r.filePath);

  const unformatted = [];
  for (const file of allJsFiles) {
    const source = fs.readFileSync(file, 'utf8');
    // prettier.check() does NOT auto-load .prettierrc the way the CLI does —
    // resolveConfig() is required or every file is judged against Prettier's
    // built-in defaults instead of this repo's actual style, producing false
    // positives (confirmed: two files this flagged as "unformatted" before
    // this fix were already clean per `npx prettier --check`).
    const config = (await prettier.resolveConfig(file)) || {};
    const isFormatted = await prettier.check(source, { ...config, filepath: file });
    if (!isFormatted) unformatted.push(path.relative(REPO_ROOT, file));
  }

  return { checkedFiles: allJsFiles, unformatted };
}

/**
 * Dependency policy: every entry in dependencies/devDependencies must be
 * pinned to a real version range, not a floating "*" or "latest". This repo
 * has no committed lockfile (package-lock.json is gitignored), so an
 * unpinned entry is the difference between a reproducible install and one
 * that silently pulls in whatever shipped an hour ago.
 */
function runDependencyCheck() {
  const pkgPath = path.join(REPO_ROOT, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const sections = ['dependencies', 'devDependencies'];
  const floating = [];

  for (const section of sections) {
    const deps = pkg[section] || {};
    for (const [name, range] of Object.entries(deps)) {
      if (range === '*' || range === 'latest' || range.trim() === '') {
        floating.push(`${section}.${name} = "${range}"`);
      }
    }
  }

  const checkedCount = sections.reduce(
    (sum, s) => sum + Object.keys(pkg[s] || {}).length,
    0
  );

  return { checkedCount, floating };
}

function assertNonVacuous(label, count) {
  if (count === 0) {
    console.error(
      `ERROR: ${label} matched 0 files — that is a broken check, not a clean pass. ` +
        'Fix the glob/config before trusting this command again.'
    );
    process.exit(2);
  }
}

async function main() {
  console.log('L3-03 code quality check\n');

  const lint = await runLint();
  assertNonVacuous('Lint glob', lint.checkedFiles.length);
  console.log(
    `Lint:   checked ${lint.checkedFiles.length} file(s) — ` +
      `${lint.errorCount} error(s), ${lint.warningCount} warning(s)`
  );
  if (lint.errorCount > 0 || lint.warningCount > 0) {
    const formatter = await new ESLint({ cwd: REPO_ROOT }).loadFormatter('stylish');
    console.log(formatter.format(lint.results));
  }

  const format = await runFormatCheck();
  assertNonVacuous('Format glob', format.checkedFiles.length);
  console.log(
    `Format: checked ${format.checkedFiles.length} file(s) — ` +
      `${format.unformatted.length} not matching Prettier style`
  );
  if (format.unformatted.length > 0) {
    for (const f of format.unformatted) console.log(`  - ${f}`);
  }

  const deps = runDependencyCheck();
  assertNonVacuous('Dependency policy', deps.checkedCount);
  console.log(
    `Deps:   checked ${deps.checkedCount} declared package(s) — ` +
      `${deps.floating.length} floating version(s)`
  );
  if (deps.floating.length > 0) {
    for (const d of deps.floating) console.log(`  - ${d}`);
  }

  const failed = lint.errorCount > 0 || format.unformatted.length > 0 || deps.floating.length > 0;
  console.log(`\nResult: ${failed ? 'FAIL' : 'PASS'}`);
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error('Check crashed before it could evaluate anything:', err);
  process.exit(2);
});
