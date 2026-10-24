// PetVerse Simulator - central balance configuration.
// All gameplay numbers live here so tuning never requires touching logic.

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
    decayPerHour: { hunger: 4, happiness: 3, energy: 2 }
  },
  actions: {
    feed: { label: 'Feed', effects: { hunger: 30, happiness: 5 }, cooldownMs: 3000 },
    play: { label: 'Play', effects: { happiness: 25, energy: -15, hunger: -5 }, cooldownMs: 5000 },
    clean: { label: 'Clean', effects: { happiness: 10 }, cooldownMs: 10000 }
  },
  economy: {
    startingCoins: 50
  },
  render: {
    // low-end Android safety: cap device pixel ratio
    maxPixelRatio: 2
  }
};
