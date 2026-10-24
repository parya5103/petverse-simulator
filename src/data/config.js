// PetVerse Simulator - central balance configuration.
// ALL gameplay numbers, timers, costs and tuning live here.

export const CONFIG = {
  save: {
    key: 'petverse-save',
    backupKey: 'petverse-save-backup',
    version: 1,
    autosaveMs: 60000
  },
  stats: {
    min: 0,
    max: 100,
    // points lost per real-world hour while away
    decayPerHour: { hunger: 4, happiness: 3, energy: 2 },
    // below this a stat bar pulses a low warning
    lowThreshold: 25
  },
  actions: {
    feed: { label: 'Feed', effects: { hunger: 30, happiness: 5 }, cooldownMs: 3000 },
    play: { label: 'Play', effects: { happiness: 25, energy: -15, hunger: -5 }, cooldownMs: 5000 },
    clean: { label: 'Clean', effects: { happiness: 10 }, cooldownMs: 10000 }
  },
  economy: {
    startingCoins: 50
  },
  starseed: {
    max: 100,
    lightPerAction: 2,
    startingLight: 0
  },
  settings: {
    defaults: { muted: false, reducedMotion: false }
  },
  intro: {
    steps: [
      { title: 'A dim island', text: 'The floating islands of PetVerse have lost their glow. Only a faint Starseed Light remains.' },
      { title: 'A spirit stirs', text: 'Your first Spirit Pet awakens. Care for it with Feed, Play and Clean to gather Starseed Light.' },
      { title: 'Restore the light', text: 'Every caring act feeds the shrine crystal. Bring back the glow of the Lost Starseed.' }
    ]
  },
  pet: {
    blinkMinMs: 2500,
    blinkMaxMs: 6000,
    blinkDurationMs: 130,
    earTwitchMinMs: 4000,
    earTwitchMaxMs: 9000,
    earTwitchDurationMs: 260,
    reactionMs: { feed: 500, play: 650, clean: 550 },
    spinTurns: 1,
    shakeWobble: 6
  },
  island: {
    moteCount: 42,
    moteSize: 0.06,
    moteSpread: 7.5,
    moteHeightMin: 1.2,
    moteHeightMax: 5.0,
    moteBobAmp: 0.4,
    moteBobSpeed: 0.8,
    crystalSpin: 0.6,
    crystalEmissiveMin: 0.35,
    crystalEmissiveMax: 1.6,
    moteOpacityMin: 0.25,
    moteOpacityMax: 0.9,
    rockCount: 3,
    rockBobAmp: 0.18,
    rockBobSpeed: 1.1
  },
  audio: {
    sounds: {
      feed: { type: 'sine', steps: [{ f: 440, d: 0.12, v: 0.08 }, { f: 660, d: 0.14, v: 0.07, delay: 0.12 }] },
      play: { type: 'triangle', steps: [{ f: 520, d: 0.1, v: 0.07 }, { f: 660, d: 0.1, v: 0.07, delay: 0.1 }, { f: 880, d: 0.12, v: 0.06, delay: 0.2 }] },
      clean: { type: 'sine', steps: [{ f: 1046, d: 0.1, v: 0.05 }, { f: 1318, d: 0.12, v: 0.05, delay: 0.09 }] },
      ui: { type: 'sine', steps: [{ f: 600, d: 0.08, v: 0.05 }] }
    }
  },
  feedback: {
    durationMs: 1400,
    risePx: 56
  },
  render: {
    // low-end Android safety: cap device pixel ratio
    maxPixelRatio: 2
  }
};
