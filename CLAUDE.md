# hinna-swagger-ui — Claude context

- **Read first:** ~/wiki/hinna/INDEX.md (+ relevant `~/wiki/hinna/cross-cutting/` page). Wiki is the maintained source; this file is deliberately thin.
- **Version:** `build.gradle` is the ONLY source of truth — never trust a version number in any doc.
- **Open items:** `~/Hinna/QUEUE.md` + the wiki page — never trust a static "no open items" claim.
- **Hard constraints:** injected per-turn by Hinna hooks (`~/.claude/skills/hinna-patterns/constraints-only.md`).

## Pat + CLI always current (owner rule 2026-11-11, CRITICAL)
Pat (hinna-ai) and the Hinna CLI are among the most important parts of the platform. Any change that adds, removes or alters an endpoint, action, field or permission must check and update Pat's and the CLI's matching tools (tool/action lists, routes, permissions, docs) in the same work or a linked PR. Every PR says how Pat/CLI were checked.
