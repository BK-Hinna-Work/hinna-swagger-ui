# Lint / format / dependency policy — hinna-swagger-ui

Ticket: L3-03 (arch-spine, non-JVM lint/format/dependency standard)

## What's enforced

| Concern | Tool | Script | Config |
|---|---|---|---|
| Lint | ESLint 9 (flat config) | `npm run lint` / `npm run lint:fix` | `eslint.config.js` |
| Format | Prettier 3 | `npm run format:check` / `npm run format` | `.prettierrc.json`, `.prettierignore` |
| Dependency freshness | npm-check-updates | `npm run deps:check` | n/a (reads package.json) |

The repo is CommonJS (no `"type": "module"` in `package.json`), pure `.js`
(no TypeScript) — the config matches that, it does not convert module style
or add a TS toolchain that isn't already there. `public/` (the built
`swagger.yaml`/`index.html` output) is excluded from both lint and format —
it's generated, not authored.

## Rollout posture (2026-08-18)

This is the first lint/format pass over the repo. Mirroring the hinna-e2e
(L3-01) and hinna-common-lib Spotless rollouts:

- **ESLint rules are all set to `warn`, not `error`.** `npm run lint` exits
  `0` today (8 `.js` files checked, 7 warnings — all `no-unused-vars` in
  `scripts/`, 0 errors) so CI (Track C) can wire it in immediately without a
  mass auto-fix commit.
- **Prettier was installed but not run with `--write`.** `npm run
  format:check` exits non-zero — **14 of 14 checked files** would be
  reformatted (the 6 `scripts/*.js` files plus docs/README/docker-compose/
  workflow YAML — all whitespace/quote-style drift, nothing behavioral). No
  file was auto-formatted by this ticket — that's a separate, reviewable
  follow-up the owner should schedule.
- Only config/doc files changed in this commit; no source file was touched.

## Promoting to a hard gate

Once the owner is ready to enforce:
1. Run `npm run format -- --write` in its own commit (review the diff, no
   logic changes expected — it's whitespace/quotes only).
2. Flip the rules this policy currently downgrades to `warn` back to `error`
   in `eslint.config.js` (see the `toWarn()` helper — remove it to restore
   `@eslint/js`'s recommended severities) and clean up the remaining 7
   warnings.
3. Add `npm run lint`, `npm run format:check`, and `npm run deps:check` to
   the CI workflow (Track C) as required steps.

## Dependency freshness

`npm run deps:check` runs `ncu` (dry-run) and lists outdated packages
without touching `package.json`. Not wired into CI as a hard gate — this is
a manual/periodic check per the same "report first" posture.
