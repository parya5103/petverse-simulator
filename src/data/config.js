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
  xp: {
    perAction: 3,
    basePerLevel: 50,   // level L -> L+1 needs basePerLevel * L xp
    coinPerLevel: 5     // each level-up awards coinPerLevel * newLevel coins
  },
  species: {
    lumipup: {
      id: 'lumipup', name: 'Lumipup', title: 'Ember Spirit',
      bodyColor: 0xffb347, snoutColor: 0xfff1d0,
      idleBobAmp: 0, idleBobSpeed: 1, idleSwayAmp: 0
    },
    dewdrop: {
      id: 'dewdrop', name: 'Dewdrop', title: 'Aqua-Sprout Spirit',
      bodyColor: 0x7fd8be, leafColor: 0x3f9e5f,
      idleBobAmp: 0.07, idleBobSpeed: 1.0, idleSwayAmp: 0.04
    },
    starling: {
      id: 'starling', name: 'Starling', title: 'Astral Spirit',
      bodyColor: 0x8e7cf0, gemColor: 0xfff2b0, tipColor: 0xfff7c0,
      idleBobAmp: 0.03, idleBobSpeed: 1.6, idleSwayAmp: 0.02
    }
  },
  eggs: {
    maxEggs: 3,
    starterSpecies: 'lumipup',
    kinds: {
      common: {
        label: 'Common Egg', cost: 30, hatchMs: 300000, lightBonus: 5,
        shellColor: 0xf5e6c8, glowColor: 0xfff2b0,
        odds: { lumipup: 0.8, dewdrop: 0.2 }
      },
      rare: {
        label: 'Rare Egg', cost: 90, hatchMs: 1200000, lightBonus: 10,
        shellColor: 0xb9e5ff, glowColor: 0x9ad7ff,
        odds: { lumipup: 0.45, dewdrop: 0.45, starling: 0.1 }
      },
      starseed: {
        label: 'Starseed Egg', cost: 250, hatchMs: 3600000, lightBonus: 20,
        shellColor: 0xc9b8ff, glowColor: 0x8e7cf0,
        odds: { lumipup: 0.1, dewdrop: 0.1, starling: 0.8 }
      }
    }
  },
  settings: {
    defaults: { muted: false, reducedMotion: false }
  },
  intro: {
    steps: [
      { title: 'A dim island', text: 'The floating islands of PetVerse have lost their glow. Only a faint Starseed Light remains.' },
      { title: 'A spirit stirs', text: 'Your first Spirit Pet awakens. Care for it with Feed, Play and Clean to gather Starseed Light.' },
      { title: 'Restore the light', text: 'Every caring act feeds the shrine crystal. Hatch eggs, collect spirits, bring back the Lost Starseed.' }
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
      hatch: { type: 'triangle', steps: [{ f: 660, d: 0.12, v: 0.07 }, { f: 880, d: 0.12, v: 0.07, delay: 0.12 }, { f: 1320, d: 0.16, v: 0.06, delay: 0.24 }] },
      levelup: { type: 'triangle', steps: [{ f: 523, d: 0.1, v: 0.07 }, { f: 659, d: 0.1, v: 0.07, delay: 0.1 }, { f: 784, d: 0.1, v: 0.07, delay: 0.2 }, { f: 1046, d: 0.18, v: 0.06, delay: 0.3 }] },
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
