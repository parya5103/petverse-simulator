// Pure stat math. No DOM, no Three.js, no storage - fully unit-testable.

import { CONFIG } from '../data/config.js';

export function clampStat(v) {
  if (typeof v !== 'number' || Number.isNaN(v)) return CONFIG.stats.min;
  return Math.min(CONFIG.stats.max, Math.max(CONFIG.stats.min, v));
}

export function createStats() {
  return { hunger: 80, happiness: 80, energy: 80 };
}

// Passive decay for a number of elapsed hours (offline or between ticks).
export function applyDecay(stats, hours) {
  const h = Math.max(0, hours || 0);
  const out = Object.assign({}, stats);
  const rates = CONFIG.stats.decayPerHour;
  for (const key of Object.keys(rates)) {
    out[key] = clampStat(out[key] - rates[key] * h);
  }
  return out;
}

// effects example: { hunger: 30, happiness: 5 }
export function applyEffects(stats, effects) {
  const out = Object.assign({}, stats);
  for (const key of Object.keys(effects)) {
    const base = typeof out[key] === 'number' ? out[key] : CONFIG.stats.min;
    out[key] = clampStat(base + effects[key]);
  }
  return out;
}

// Offline progress: decay by wall-clock time since the last save.
export function applyOffline(stats, lastTimestamp, nowMs) {
  const hours = Math.max(0, (nowMs - lastTimestamp) / 3600000);
  return applyDecay(stats, hours);
}

// Starseed Light progress: clamped accumulation, capped at max.
export function addStarseedLight(current, gain) {
  const c = (typeof current === 'number' && Number.isFinite(current)) ? Math.max(0, current) : 0;
  const g = (typeof gain === 'number' && Number.isFinite(gain)) ? gain : 0;
  return Math.min(CONFIG.starseed.max, c + g);
}
