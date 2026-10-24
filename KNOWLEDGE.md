# PetVerse Simulator - Project Knowledge

Agent-maintained project memory. Update after every verified milestone.

## Purpose

Mobile-first 3D virtual pet browser game. Target: coins, collectible pets, egg hatching, upgrades, shops, progression, local saves. Budget: Rs 0. Free hosting on GitHub Pages. Owner works from an Android phone.

## Architecture

    index.html          - HUD markup, Three.js CDN import map
    styles.css          - mobile-first HUD styling, safe-area insets
    src/main.js         - wiring: state, UI, actions, autosave, render loop
    src/data/config.js  - ALL balance numbers (single source of tuning)
    src/core/bus.js     - event bus (on/emit)
    src/state/fsm.js    - idle/acting state machine, blocks overlapping actions
    src/state/save.js   - versioned save envelope, primary+backup keys, injected storage
    src/gameplay/petStats.js - pure stat math: clamp, decay, effects, offline
    src/render/scene.js - Three.js scene, drag-to-orbit camera rig, resize
    src/render/pet.js   - procedural pet (no assets), hop w/ squash-stretch

Key decisions:
- Zero build step: Three.js via CDN import map, vanilla ES modules.
- Save format: {version, timestamp, state{coins, stats}}; version 1; refuse future versions; backup key holds previous good save.
- Decay rates: hunger 4/h, happiness 3/h, energy 2/h (real time, applied offline on load).
- Config-driven balance; logic modules are dependency-free for headless testing.

## Commands

- CI (automatic on push): node --check syntax gate on all .js files.
- Local run: any static server (python3 -m http.server). file:// will not load ES modules.

## Environment constraints (verified)

- GitHub App cannot create repos (403) - owner creates repos manually.
- No tool to enable GitHub Pages - owner manual step: Settings -> Pages -> main branch.
- Sandbox testing recipe: strip import lines + export prefixes, then new Function(deps, body + return object). Works for pure-logic modules only.

## Milestones

- Phase 0 (commit afd498a, CI #1 passed): skeleton + CI.
- Phases 1-3: bus/FSM/config, stats+actions+saves, scene+pet. 21/21 sandbox logic tests passed pre-push.

## Known limitations

- Coins are displayed and saved but not spent yet (economy arrives with egg shop in Phase 4).
- No browser/device test yet - logic verified headless only; Three.js rendering unverified on a real device.
- Only one pet species (procedural). Hatch flow not built yet.

## Next steps

- Phase 4: egg shop (spend coins), hatch flow with timed egg, collection journal, 3 species.
- Phase 5: XP/levels/upgrades.
- Phase 6 (optional): PWA manifest + service worker.
