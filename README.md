# PetVerse Simulator

A mobile-first 3D virtual pet browser game. Feed, play with, and clean your pet; watch it hop around a small procedural 3D world. Built with vanilla ES modules and Three.js - zero build step, zero dependencies, zero cost.

## Status

- Phase 0: project skeleton, CI syntax gate (done)
- Phase 1: event bus, FSM, central config (done)
- Phase 2: pet stats with offline decay, Feed/Play/Clean actions, versioned local saves with backup (done)
- Phase 3: Three.js scene with drag-to-orbit camera, procedural pet with hop animation (done)
- Phase 4 (next): egg shop, hatching, collection journal, multiple species
- Phase 5: XP, levels, upgrades
- Phase 6 (optional): PWA offline support

## Tech

- Three.js 0.160 loaded from a CDN import map (no npm install, no bundler)
- Vanilla ES modules, no framework
- localStorage saves: versioned envelope `{version, timestamp, state}` with a backup copy
- Stats decay in real time (hunger 4/h, happiness 3/h, energy 2/h), applied on load for offline progress
- Pointer events for touch + mouse (drag anywhere to orbit the camera)

## Run locally

ES modules require an HTTP server (opening index.html directly from file:// will not work):

    python3 -m http.server 8000

then open http://localhost:8000. Any other static file server works too.

## Deployment

Free static hosting: GitHub Pages. In the repo: Settings -> Pages -> Deploy from a branch -> main -> Save. The site then lives at:

    https://<user>.github.io/petverse-simulator/

## Testing

CI runs `node --check` on every .js file (syntax gate) on each push and pull request. Pure game logic (stats math, save system, event bus, FSM) is written dependency-free so it can be tested without a browser.

## License

All code in this repository is original. Third-party assets (if added later) must be CC0 or credited in CREDITS.md.
