// Pure XP / level math. No DOM, no Three.js - fully unit-testable.

import { CONFIG } from '../data/config.js';

// Level 1 at 0 xp. Level L -> L+1 costs basePerLevel * L xp.
export function levelFromXp(xp) {
  const base = CONFIG.xp.basePerLevel;
  let level = 1;
  let need = base;
  let remaining = (typeof xp === 'number' && Number.isFinite(xp)) ? Math.max(0, xp) : 0;
  while (remaining >= need) {
    remaining -= need;
    level += 1;
    need = base * level;
  }
  return level;
}

// Gain xp; returns new xp, level, levels gained and coin award for level-ups.
export function applyXp(currentXp, gain) {
  const base = (typeof currentXp === 'number' && Number.isFinite(currentXp)) ? Math.max(0, currentXp) : 0;
  const g = (typeof gain === 'number' && Number.isFinite(gain)) ? gain : 0;
  const before = levelFromXp(base);
  const after = levelFromXp(base + g);
  let coins = 0;
  for (let l = before + 1; l <= after; l++) {
    coins += CONFIG.xp.coinPerLevel * l;
  }
  return { xp: base + g, level: after, levels: after - before, coins: coins };
}
