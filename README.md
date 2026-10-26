# PetVerse: The Lost Starseed

A mobile-first 3D virtual pet browser game. The floating islands are losing their glow - care for your Spirit Pet (Feed, Play, Clean) to restore Starseed Light, earn coins and XP, hatch eggs, collect spirits, and awaken new islands. Built with vanilla ES modules and Three.js - zero build step, zero dependencies, zero cost, 100% procedural (no external models, textures, or audio files).

## Status

- [Implemented - Pending Full Verification] Phase 0: project skeleton, CI syntax gate
- [Implemented - Pending Full Verification] Phases 1-3: event bus, FSM, config-driven stats with offline decay, Feed/Play/Clean actions, versioned local saves with backup, drag-to-orbit camera, procedural hopping pet
- [Implemented - Pending Full Verification] Slice 1 "Lost Starseed": shrine crystal + floating light motes (glow scales with Starseed Light), pet blinking + ear twitches + action reactions, glassmorphic mobile HUD with low-stat warnings, floating feedback, 3-step skippable intro, settings (mute + reduced motion), Web Audio synth
- [Implemented - Pending Full Verification] Phase 4: egg shop (Common / Rare / Starseed eggs), coin economy, timed incubation with ready-pulse egg meshes on the island, hatching with species reveal, 3 procedural species (Lumipup, Dewdrop, Starling), Spirit Collection journal with active-pet switching
- [Implemented - Pending Full Verification] Phase 5 (lite): XP per action, levels with coin rewards, level display in HUD
- [Implemented - Pending Full Verification] PWA: manifest + SVG icon + service worker (offline app shell, network-first updates)
- [Planned] Phase 5 (rest): upgrade shop (faster decay resistance, cheaper eggs), daily bonuses
- [Planned] Phase 6: more islands, unlockable at Starseed Light thresholds

Creative direction and design spec: docs/DESIGN_SPEC.md

## Tech

- Three.js 0.160 loaded from a CDN import map (no npm install, no bundler)
- Vanilla ES modules, no framework; PWA service worker with no build step
- localStorage saves: versioned envelope with a backup copy; new keys migrate with safe defaults (never breaks old saves)
- Stats decay in real time (hunger 4/h, happiness 3/h, energy 2/h), applied on load for offline progress
- Egg odds, costs, hatch times, XP curve: all in src/data/config.js
- Pointer events for touch + mouse (drag anywhere to orbit the camera)
- Web Audio API synth for optional sound (no audio files); fully playable muted
- prefers-reduced-motion respected, with an in-game override

## Run locally

ES modules require an HTTP server (opening index.html directly from file:// will not work):

    python3 -m http.server 8000

then open http://localhost:8000. Any other static file server works too.

## Deployment

Free static hosting: GitHub Pages (already enabled, deploy on push to main). Live URL:

    https://parya5103.github.io/petverse-simulator/

When changing any cached file, bump CACHE_VERSION in sw.js so service-worker clients pick up the update.

## Testing

CI runs `node --check` on every .js file under src/ (syntax gate) on each push and pull request. Pure game logic (stats math, save system, migrations, progression, egg economy, event bus, FSM) is dependency-free and tested headless in the sandbox before every push.

## License

All code in this repository is original. Third-party assets (if added later) must be CC0 or credited in CREDITS.md.
