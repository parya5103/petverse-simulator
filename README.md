# PetVerse Simulator

Mobile-first 3D virtual pet game for the browser. Coins, collectible pets, egg hatching, upgrades, shop, progression, and local saves.

- Zero build step: Three.js loaded via CDN import map (no npm dependencies, no bundler).
- Mobile-first: tap/pointer controls, safe-area aware HUD, capped pixel ratio for Android performance.
- Free hosting: GitHub Pages.

## Play

https://parya5103.github.io/petverse-simulator/

## Run locally

ES modules require a local server (opening index.html via file:// will not work):

    python3 -m http.server 8642
    # or: npx serve .

Then open http://localhost:8642

## Structure

    index.html            entry point + HUD + import map
    styles.css            mobile-first UI styling
    src/main.js           scene bootstrap, placeholder pet, tap interaction
    KNOWLEDGE.md          project knowledge base (read first)
    AGENTS.md             rules for AI coding agents

Planned: src/data/ (config tables), src/state/ (save/load), src/gameplay/ (actions, economy).

## CI

Every push runs a syntax check on all ES modules (.github/workflows/ci.yml).

## Roadmap

- Phase 0: skeleton + deploy (done)
- Phase 1: core shell (camera rig, FSM, event bus)
- Phase 2: pet stats (hunger, happiness, energy), feed/play/clean actions
- Phase 3: SaveManager (versioned localStorage saves, offline progress)
- Phase 4: coins, egg shop, hatching, collection
- Phase 5: upgrades, XP, levels (config-driven)
- Phase 6 (optional): PWA install, more species, achievements

## Credits

- Built with three.js (MIT).
- Architecture reference: TIDELINE (MIT) - github.com/bridge-mind/tideline
