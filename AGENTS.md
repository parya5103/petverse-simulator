# AGENTS.md - Rules for AI coding agents working on this repo

Read KNOWLEDGE.md first. It is the project source of truth and holds the research summary, stack decisions, and roadmap.

## Hard rules
1. Mobile-first. Every feature must work with touch (pointer events). Desktop keyboard is a bonus, never the only input.
2. Zero build step. No npm dependencies, no bundlers, no frameworks. Three.js stays on the CDN import map.
3. Free only. No paid APIs, no accounts, no analytics, no backend.
4. The repo stays public (GitHub Pages on the Free plan requires it).
5. Never copy code from repositories without a verified MIT or CC0 license. When adapting MIT code, add attribution in README Credits. Assets with unclear licensing are forbidden; record every added asset in CREDITS.md.
6. Smallest safe change. Preserve existing features, architecture, and player saves. Never delete or reset user save data.

## Code style
- Vanilla ES modules. ASCII characters only in source files.
- All tuning and balance numbers live in src/data/config.js - no magic numbers in logic modules.
- Small single-purpose modules. DOM UI (HUD, dialogs) in index.html + styles.css; 3D scene code in src/.

## Verification before every push
- Syntax check each edited JS file when no browser is available (strip import lines, new Function parse).
- State clearly what was NOT tested. Never claim a feature works, tests pass, or a deploy succeeded without evidence.

## Report after each task
DONE / FILES / TESTS / NOT VERIFIED / NEXT ACTION - simple Hinglish, only what is actually verified.
