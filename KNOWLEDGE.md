# PetVerse Simulator - Project Knowledge

Agent-maintained project memory. Read AGENTS.md first for repo rules. Update this file after every verified milestone. Statuses: [Implemented & Verified] / [Implemented - Pending Full Verification] / [Planned].

## Purpose

PetVerse: The Lost Starseed - mobile-first 3D virtual pet browser game. Premise: floating islands lost their glow; care actions restore Starseed Light. Target: coins, collectible pets, egg hatching, upgrades, shops, progression, local saves. Budget: Rs 0. GitHub Pages hosting. Owner works from an Android phone. Approved creative direction lives in docs/DESIGN_SPEC.md.

## Architecture

    index.html              - HUD, intro overlay, settings sheet, CDN import map
    styles.css              - design tokens (:root), glass panels, low-stat pulse, feedback rise
    src/main.js             - wiring: state, UI, actions, audio, settings, FTUE, autosave
    src/data/config.js      - ALL balance numbers, timers, costs (single tuning source)
    src/core/bus.js         - event bus
    src/core/audio.js       - Web Audio synth (procedural tones, mute-aware, no assets)
    src/state/fsm.js        - idle/acting FSM
    src/state/save.js       - versioned envelope, primary+backup keys, injected storage
    src/state/migrations.js - normalizeState: safe defaults for new keys (pure, tested)
    src/gameplay/petStats.js - pure math: clamp, decay, effects, offline, starseed light
    src/render/scene.js     - Three.js scene, orbit camera rig, lights, ground + water
    src/render/island.js    - shrine crystal, bobbing rocks, light motes, setGlow(0..1)
    src/render/pet.js       - procedural Lumipup: blink, ear twitch, hop, reactions
    src/ui/ftue.js          - 3-step skippable intro overlay
    src/ui/feedback.js      - floating "+N Light" popups

Key decisions:
- Zero build step: Three.js 0.160 via CDN import map (jsdelivr), vanilla ES modules.
- Save envelope {version, timestamp, state} stays version 1; additive keys (hasSeenIntro, starseedLight, settings) migrate via normalizeState with safe defaults. Old saves load unchanged.
- Starseed Light: +2 per care action, cap 100; drives crystal emissive + mote opacity + HUD light bar.
- Reduced motion: OS preference auto-detected on first run of the feature, in-game toggle persists in state.settings.reducedMotion; body.reduced-motion + pet.setReducedMotion disable spins/shakes/bobs.
- Audio: optional Web Audio synth, unlocked on first pointerdown (autoplay policy); game fully playable muted.
- Config-driven balance; logic modules dependency-free for headless testing.

## Commands

- CI (automatic on push): node --check on all src/**/*.js.
- Local run: any static server (python3 -m http.server). file:// will not load ES modules.

## Status ledger

- [Implemented & Verified] CI syntax gate (.github/workflows/ci.yml): run #1 pass (afd498a), run #2 pass (b42d0ca).
- [Implemented & Verified] Pure logic, sandbox-tested pre-push: bus, fsm, config, petStats (decay/effects/offline/clamp/starseed), save (round-trip, backup fallback, future-version refuse, invalid-coins refuse, clear), migrations (defaults, tamper-safety, clamp), HTML id wiring.
- [Implemented - Pending Full Verification] Phases 1-3 (b42d0ca): orbit camera, procedural pet + hop, stat HUD, actions with cooldowns, autosave 60s + visibilitychange/pagehide, offline decay.
- [Implemented - Pending Full Verification] Slice 1 "Lost Starseed": shrine crystal + motes with setGlow, water disc, hemisphere light, pet blinking/ear-twitch/reactions (feed nod, play spin, clean shake), glass HUD with light bar + low-stat pulse, settings sheet (mute/reduced motion), 3-step skippable intro with hasSeenIntro flag, floating +Light feedback, Web Audio synth. All pushed, CI pending at write time; no live browser/device test yet.
- [Planned] Phase 4: egg shop (spend coins), timed hatch flow, collection journal, 3 species (Lumipup live; Dewdrop, Starling in spec).
- [Planned] Phase 5: XP, levels, upgrades. [Planned] Phase 6: PWA.

## Environment constraints (verified)

- GitHub App cannot create repos (403). No tool enables Pages - owner did it manually; Pages deploy workflow runs on every push to main.
- Sandbox test recipe: strip import lines + ^export prefixes; new Function(deps, body + return {names}) for logic; new Function(body) as syntax parse for render modules. All repo file content ASCII-only.
- Push pipeline: author local files, ONE run_typescript program reads them via tools.file_system.read_file, validates (ASCII + syntax + tests), then pushes the same verified bytes with github_app.push_files. Never build content as giant string arrays.
- Direct api.github.com rate-limited via proxy; use https://r.jina.ai/https://api.github.com/... with a cache-buster query param. Do not busy-wait in sandbox (operation budget).
- Copilot review available via github_app.request_copilot_review on PRs (needs _confirmationReason); no PRs yet.
- Research references (do not copy code): tideline (MIT - config-driven/FSM/economy patterns), MineWorld (MIT - touch + perf), Meowniverse and cconsta1/tamagotchi (NO license - pattern study only). Assets: CC0 only (Kenney, Quaternius, Poly Haven); CREDITS.md required when assets are added.

## Milestones

- Phase 0 (afd498a): skeleton + CI.
- Phases 1-3 (b42d0ca): core game loop. 22/22 sandbox tests.
- Slice 1 "Lost Starseed" (this push): island polish + pet expressiveness + cohesive HUD + FTUE + settings + audio. Sandbox tests extended for migrations + starseed math.

## Known limitations

- No real browser/device test yet: rendering, touch, Web Audio, and overlays verified headless only (logic + syntax).
- Coins still not spent (economy lands with the egg shop).
- One species; hatch flow not built.

## Next authorized micro-milestone

Phase 4a - Egg Shop foundation: egg shop modal (Common egg, 30 coins, from config), buy flow with coin check, egg inventory in state (migrated key), timed hatch (5 min), hatch reveal reusing pet.js species parameter. No island unlocks yet.
