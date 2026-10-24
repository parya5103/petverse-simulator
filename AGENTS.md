# AGENTS.md - Rules for AI coding agents working on this repo

Read KNOWLEDGE.md first. It is the project source of truth and holds the research summary, stack decisions, and roadmap. The approved creative direction lives in docs/DESIGN_SPEC.md.

## Hard rules
1. Mobile-first. Every feature must work with touch (pointer events). Desktop keyboard is a bonus, never the only input.
2. Zero build step. No npm dependencies, no bundlers, no frameworks. Three.js stays on the CDN import map.
3. Free only. No paid APIs, no accounts, no analytics, no backend.
4. The repo stays public (GitHub Pages on the Free plan requires it).
5. Never copy code from repositories without a verified MIT or CC0 license. When adapting MIT code, add attribution in README Credits. Assets with unclear licensing are forbidden; record every added asset in CREDITS.md.
6. Smallest safe change. Preserve existing features, architecture, and player saves. Never delete or reset user save data.
7. Procedural only. No external 3D models (.glb/.gltf), textures, or audio files. Everything is Three.js primitives, code, CSS, and Web Audio synthesis.
8. Save compatibility. New state keys must be optional with safe defaults via src/state/migrations.js. Never bump the save version for additive changes.

## Code style
- Vanilla ES modules. ASCII characters only in source files.
- All tuning and balance numbers live in src/data/config.js - no magic numbers in logic modules.
- Small single-purpose modules. DOM UI (HUD, dialogs) in index.html + styles.css + src/ui/; 3D scene code in src/render/; pure logic in src/gameplay/ and src/state/.
- Reuse geometries/materials; dispose temporary objects; keep draw calls low for mid-range Android 60 FPS.

## Milestone workflow
- Work in surgical micro-milestones. One milestone = one commit = one clear feature slice.
- Before starting, re-check the next authorized milestone in KNOWLEDGE.md.
- After each milestone, update KNOWLEDGE.md statuses.

## Status tags in KNOWLEDGE.md
- [Implemented & Verified] - tested with real evidence (CI, unit tests).
- [Implemented - Pending Full Verification] - code pushed, logic tested headless, but not tested in a live browser/device.
- [Planned] - designed, not built.

## Verification before every push
- Syntax check each edited JS file when no browser is available (strip import lines, new Function parse).
- Run sandbox unit tests for all pure logic (stats, saves, migrations) - they must all pass.
- State clearly what was NOT tested. Never claim a feature works, tests pass, or a deploy succeeded without evidence.

## Report after each task
DONE / FILES / TESTS / NOT VERIFIED / NEXT ACTION - simple Hinglish, only what is actually verified.
