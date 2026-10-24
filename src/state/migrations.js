// Safe state normalization: fills defaults for new state keys without
// touching old ones. Pure module - fully unit-testable.
// Additive keys never bump the save envelope version.

import { CONFIG } from '../data/config.js';

function safeStat(v, fallback) {
  if (typeof v !== 'number' || !Number.isFinite(v)) return fallback;
  return Math.min(CONFIG.stats.max, Math.max(CONFIG.stats.min, v));
}

// raw: loaded save state (may be missing new keys entirely) or a fresh seed
export function normalizeState(raw) {
  const defaults = CONFIG.settings.defaults;
  const s = (raw && typeof raw === 'object') ? raw : {};
  // preserve any unknown extra keys for forward compatibility
  const out = Object.assign({}, s);

  out.coins = (typeof s.coins === 'number' && Number.isFinite(s.coins))
    ? s.coins
    : CONFIG.economy.startingCoins;

  const st = (s.stats && typeof s.stats === 'object') ? s.stats : {};
  out.stats = {
    hunger: safeStat(st.hunger, 80),
    happiness: safeStat(st.happiness, 80),
    energy: safeStat(st.energy, 80)
  };

  out.starseedLight = (typeof s.starseedLight === 'number' && Number.isFinite(s.starseedLight))
    ? Math.min(CONFIG.starseed.max, Math.max(0, s.starseedLight))
    : CONFIG.starseed.startingLight;

  out.hasSeenIntro = s.hasSeenIntro === true;

  const set = (s.settings && typeof s.settings === 'object') ? s.settings : {};
  out.settings = {
    muted: typeof set.muted === 'boolean' ? set.muted : defaults.muted,
    reducedMotion: typeof set.reducedMotion === 'boolean' ? set.reducedMotion : defaults.reducedMotion
  };

  return out;
}

// Returns true when the raw state had no settings object at all
// (first run after this feature shipped -> allow OS preference detection).
export function missingSettings(raw) {
  return !(raw && typeof raw === 'object' && raw.settings && typeof raw.settings === 'object');
}
