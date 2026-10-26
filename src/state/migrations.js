// Safe state normalization: fills defaults for new state keys without
// touching old ones. Pure module - fully unit-testable.
// Additive keys never bump the save envelope version.

import { CONFIG } from '../data/config.js';

function safeStat(v, fallback) {
  if (typeof v !== 'number' || !Number.isFinite(v)) return fallback;
  return Math.min(CONFIG.stats.max, Math.max(CONFIG.stats.min, v));
}

function speciesKeys() {
  return Object.keys(CONFIG.species);
}

function safeEggs(list) {
  if (!Array.isArray(list)) return [];
  const kinds = CONFIG.eggs.kinds;
  const valid = speciesKeys();
  const out = [];
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    if (!item || typeof item !== 'object') continue;
    if (!kinds[item.rarity]) continue;
    if (typeof item.hatchAt !== 'number' || !Number.isFinite(item.hatchAt)) continue;
    if (valid.indexOf(item.species) < 0) continue;
    if (out.length >= CONFIG.eggs.maxEggs) break;
    out.push({ rarity: item.rarity, species: item.species, hatchAt: item.hatchAt });
  }
  return out;
}

function safeCollection(obj) {
  const out = {};
  if (!obj || typeof obj !== 'object') return out;
  const valid = speciesKeys();
  for (let i = 0; i < valid.length; i++) {
    const v = obj[valid[i]];
    if (typeof v === 'number' && Number.isFinite(v) && v > 0) {
      out[valid[i]] = Math.floor(v);
    }
  }
  return out;
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

  out.xp = (typeof s.xp === 'number' && Number.isFinite(s.xp) && s.xp > 0) ? s.xp : 0;

  const valid = speciesKeys();
  out.activeSpecies = (typeof s.activeSpecies === 'string' && valid.indexOf(s.activeSpecies) >= 0)
    ? s.activeSpecies
    : CONFIG.eggs.starterSpecies;

  out.eggs = safeEggs(s.eggs);
  out.collection = safeCollection(s.collection);
  // fresh save: the starter spirit is owned from the beginning
  if (!s.collection) {
    const starter = CONFIG.eggs.starterSpecies;
    out.collection[starter] = (out.collection[starter] || 0) + 1;
  }

  return out;
}

// Returns true when the raw state had no settings object at all
// (first run after this feature shipped -> allow OS preference detection).
export function missingSettings(raw) {
  return !(raw && typeof raw === 'object' && raw.settings && typeof raw.settings === 'object');
}
