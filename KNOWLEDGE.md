# PetVerse Simulator - Project Knowledge

Owner: Pratik. Budget: Rs 0 (free tools only). Platform: browser, Android-first. Hosting: GitHub Pages (repo must stay PUBLIC - GitHub Free does not serve Pages for private repos).

## What this is
Mobile-first 3D virtual pet simulator. Coins, collectible pets, egg hatching, upgrades, shop, progression, local saves. No backend, no accounts, no analytics.

## Stack (decided, do not change without owner approval)
- Three.js 0.170 via CDN import map (jsdelivr). Zero build step. Vanilla ES modules. No npm dependencies, no frameworks, no bundler.
- All tuning/balance numbers live in src/data/config.js (data-driven, pattern from TIDELINE).
- Persistence (planned Phase 3): localStorage, versioned envelope {version, timestamp, state}, backup key, migration hook, autosave every 60s, offline progress on load. Pattern inspired by Meowniverse SaveManager - REIMPLEMENTED, never copied (no license there).

## Research summary (done 2026-10, do not re-research)
- Foundation reference: TIDELINE github.com/bridge-mind/tideline (MIT). Zero-build CDN structure, FSM, economy, data-driven config, DOM HUD. Adapt architecture, do not copy fishing gameplay.
- Mobile touch pattern: MineWorld github.com/EVEDensity/MineWorld (MIT). Joystick/swipe/buttons + perf discipline (per-frame generation limits, fog, culling).
- Save pattern: Meowniverse github.com/akash098p/Meowniverse (NO license file - reference only, never copy code).
- Egg hatch pattern: cconsta1/tamagotchi (NO license file - study only; its robot model is CC0 from Quaternius/Tomas Laulhe).
- NEVER copy code from: Petrix, Meowniverse, cconsta1/tamagotchi, goose-catch, ZigZag (copyleft). Only MIT sources may be adapted, with attribution.

## Performance rules (Android)
- Cap devicePixelRatio at 2. Shadow map 1024. Procedural geometry first.
- Any GLB asset under ~5MB, loaded lazily. One render loop, delta clamped at 0.05s.

## Asset policy
- Primary sources CC0 only: Kenney (kenney.nl), Quaternius (quaternius.com), Poly Haven (polyhaven.com).
- game-icons.net is CC BY 4.0 - needs a credit line. Poly Pizza / Freesound: check per-item license.
- Keep CREDITS.md updated whenever an external asset is added.

## Pipeline notes (Vibe agent)
- Push via github_app.push_files with in-memory content in one commit. NEVER round-trip content through jq or tools.file_system read/write (UTF-8 mojibake risk). Keep file content ASCII-only.
- Syntax check JS before push: strip import lines, then new Function(body) parse.
- Repo creation and Pages enabling are manual owner steps (GitHub App lacks those permissions).
- Report format after each task: DONE / FILES / TESTS / NOT VERIFIED / NEXT ACTION in simple Hinglish. Never claim untested behavior works.

## Roadmap
- Phase 0: skeleton + deploy (index.html, styles.css, src/main.js). DONE.
- Phase 1: core shell - camera rig, explicit FSM (menu, idle, interacting, shop, hatching), tiny event bus.
- Phase 2: pet stats (hunger, happiness, energy) + feed/play/clean actions, tap interactions.
- Phase 3: SaveManager (versioned localStorage, backup key, migration, autosave 60s, offline progress).
- Phase 4: economy - coins from care actions, egg shop, hatch flow, collection journal, 3 pets.
- Phase 5: progression - XP, levels, 2 upgrade tiers, all in src/data/config.js.
- Phase 6 (optional): PWA (manifest + service worker), more species, achievements.
