# PetVerse Simulator - Project Knowledge

Agent-maintained project memory. Read AGENTS.md first for repo rules. Update this file after every verified milestone. Statuses: [Implemented & Verified] / [Implemented - Pending Full Verification] / [Planned].

## Purpose

PetVerse: The Lost Starseed - mobile-first 3D virtual pet browser game. Premise: floating islands lost their glow; care actions restore Starseed Light. Target: coins, collectible pets, egg hatching, upgrades, shops, progression, local saves. Budget: Rs 0. GitHub Pages hosting. Owner works from an Android phone. Approved creative direction lives in docs/DESIGN_SPEC.md.

## Architecture

    index.html              - HUD, nav bar, intro overlay, sheets, CDN import map, manifest link
    styles.css              - design tokens (:root), glass panels, sheets, cards, low-stat pulse, reduced-motion
    src/main.js             - wiring: state, UI, actions, xp, eggs/hatching, collection, audio, settings, FTUE, autosave, SW registration
    src/data/config.js      - ALL balance numbers: stats, actions, starseed, xp, species, eggs (costs/odds/times), audio, feedback
    src/core/bus.js         - event bus
    src/core/audio.js       - Web Audio synth (procedural tones, mute-aware, no assets)
    src/state/fsm.js        - idle/acting FSM
    src/state/save.js       - versioned envelope, primary+backup keys, injected storage
    src/state/migrations.js - normalizeState: safe defaults for new keys (pure, tested)
    src/gameplay/petStats.js - pure math: clamp, decay, effects, offline, starseed light
    src/gameplay/progression.js - pure XP/level math + level-up coin rewards
    src/gameplay/eggs.js    - pure egg economy: roll odds, buy, ready, hatch, collect
    src/render/scene.js     - Three.js scene, orbit camera rig, lights, ground + water
    src/render/island.js    - shrine crystal, bobbing rocks, light motes, setGlow(0..1)
    src/render/pet.js       - 3 procedural species (Lumipup/Dewdrop/Starling), blink, twitch, hop, reactions, dispose
    src/render/egg.js       - incubating egg meshes (shared geometry, per-rarity materials, ready pulse)
    src/ui/ftue.js          - 3-step skippable intro overlay
    src/ui/feedback.js      - floating "+N Light" popups
    src/ui/eggShop.js       - Egg Shop bottom sheet (cards from config)
    src/ui/collection.js    - Spirit Collection sheet (owned counts, active switch)
    sw.js                   - service worker: offline shell, network-first, CACHE_VERSION bump on asset changes
    manifest.webmanifest    - PWA manifest (SVG icon)
    docs/DESIGN_SPEC.md     - approved creative direction

Key decisions:
- Zero build step: Three.js 0.160 via CDN import map (jsdelivr), vanilla ES modules. No npm, no bundler.
- Save envelope {version, timestamp, state} stays version 1; additive keys (hasSeenIntro, starseedLight, settings, xp, activeSpecies, eggs, collection) migrate via normalizeState with safe defaults. Old saves load unchanged - unit tested.
- Starseed Light: +2 per care action + egg hatch bonuses, cap 100; drives crystal emissive, mote opacity, HUD light bar.
- Egg economy: Common 30c/5min (80/20 lumipup/dewdrop), Rare 90c/20min (45/45/10), Starseed 250c/60min (10/10/80 starling). Max 3 incubating eggs. Species rolled at buy, revealed at hatch.
- Collection: starter lumipup owned by default; hatching increments counts; active pet switchable, old pet disposed properly.
- XP: +3 per action; level L needs 50*L xp; level-up awards 5*level coins + toast + sound.
- Reduced motion: OS preference auto-detected on first run of the feature; in-game toggle persists in state.settings.reducedMotion.
- Audio: optional Web Audio synth, unlocked on first pointerdown; game fully playable muted.
- Logic modules are dependency-free and injected-storage/rng, testable headless.

## Commands

- CI (automatic on push): node --check on all src/**/*.js (sw.js is root-level, checked in sandbox pre-push).
- Local run: any static server (python3 -m http.server). file:// will not load ES modules.
- Deploy note: bump CACHE_VERSION in sw.js whenever any cached file changes, else SW clients keep stale assets.

## Status ledger

- [Implemented & Verified] CI syntax gate: runs #1, #2, #3 all pass (afd498a, b42d0ca, 38ea6ab).
- [Implemented & Verified] Pure logic, sandbox-tested pre-push: bus, fsm, config, petStats, save, migrations, progression (xp/levels), egg economy (buy/ready/hatch/odds), HTML id wiring.
- [Implemented - Pending Full Verification] Phases 1-3 (b42d0ca): orbit camera, procedural pet + hop, stat HUD, actions with cooldowns, autosave, offline decay.
- [Implemented - Pending Full Verification] Slice 1 (38ea6ab): island polish, pet expressiveness, glass HUD, FTUE, settings, audio synth. Live site serves this build (verified via rendered text).
- [Implemented - Pending Full Verification] Phase 4 + 5-lite + PWA (this push): egg shop, timed hatch, 3 species, collection journal with active switching, xp/levels/coin rewards, level chip, nav bar, service worker + manifest + icon. Logic tested headless; no browser/device test yet.
- [Planned] Upgrade shop (decay resistance, egg discounts), daily bonus, more islands at light thresholds.

## Environment constraints (verified)

- GitHub App cannot create repos (403). No tool enables Pages - owner did it manually; Pages deploy workflow runs on every push to main.
- Sandbox test recipe: strip import lines + ^export prefixes; new Function(deps, body + return {names}) for logic; new Function(body) as syntax parse for render modules. All repo file content ASCII-only.
- Push pipeline: author local files, ONE run_typescript program reads them via tools.file_system.read_file, validates (ASCII + syntax + tests), then pushes the same verified bytes with github_app.push_files. Never build content as giant string arrays.
- The local /home/user/petverse workspace is EPHEMERAL: it is wiped between sessions/turns. Unchanged repo files can be fetched via github_app.get_file_contents when needed for tests; do not assume local copies persist.
- Direct api.github.com rate-limited via proxy; use https://r.jina.ai/https://api.github.com/... with a cache-buster query param. Do not busy-wait in sandbox (operation budget).
- Copilot review available via github_app.request_copilot_review on PRs (needs _confirmationReason); no PRs yet.
- Research references (do not copy code): tideline (MIT - config-driven/FSM/economy patterns), MineWorld (MIT - touch + perf), Meowniverse and cconsta1/tamagotchi (NO license - pattern study only). Assets: CC0 only (Kenney, Quaternius, Poly Haven); CREDITS.md required when assets are added.

## Milestones

- Phase 0 (afd498a): skeleton + CI.
- Phases 1-3 (b42d0ca): core care loop. 22/22 sandbox tests.
- Slice 1 (38ea6ab): Lost Starseed look + FTUE + settings + audio. 38/38 sandbox tests.
- Phase 4 + 5-lite + PWA (this push): full egg economy, collection, 3 species, xp/levels, PWA. ~60 sandbox tests.

## Known limitations

- No real browser/device test yet: rendering, touch, Web Audio, SW caching, and overlays verified headless only (logic + syntax). SW offline behavior especially needs a real device check.
- PWA install prompt depends on browser icon requirements (SVG only); Chrome may want PNG icons - do not promise installability.
- Upgrades/daily bonus/islands not built.

## Next authorized micro-milestone

Owner device test of the live build first (walkthrough: intro, feed/play/clean, buy egg, wait/hatch, switch pet, settings). Then: upgrade shop v1 - two upgrades (Feather Charm: decay -25%; Starmap Lens: egg costs -15%), costs in config, upgrades sheet reusing the cards pattern, state key `upgrades` migrated.
