// Pure egg economy logic: buy, incubate, hatch, collect.
// No DOM, no Three.js - rng injectable for tests.

import { CONFIG } from '../data/config.js';

// Roll a species from an egg kind's odds table.
export function rollSpecies(kindKey, rng) {
  const kind = CONFIG.eggs.kinds[kindKey];
  if (!kind) return CONFIG.eggs.starterSpecies;
  const r = (typeof rng === 'function') ? rng() : Math.random();
  const keys = Object.keys(kind.odds);
  let acc = 0;
  for (let i = 0; i < keys.length; i++) {
    acc += kind.odds[keys[i]];
    if (r < acc) return keys[i];
  }
  return keys[0];
}

export function canBuyEgg(state, kindKey, nowMs) {
  const kind = CONFIG.eggs.kinds[kindKey];
  if (!kind) return false;
  if (typeof state.coins !== 'number' || state.coins < kind.cost) return false;
  const eggs = Array.isArray(state.eggs) ? state.eggs : [];
  if (eggs.length >= CONFIG.eggs.maxEggs) return false;
  return true;
}

// Returns updated {coins, eggs} or null when the buy is not allowed.
export function buyEgg(state, kindKey, nowMs, rng) {
  if (!canBuyEgg(state, kindKey, nowMs)) return null;
  const kind = CONFIG.eggs.kinds[kindKey];
  const species = rollSpecies(kindKey, rng);
  const eggs = Array.isArray(state.eggs) ? state.eggs : [];
  return {
    coins: state.coins - kind.cost,
    eggs: eggs.concat([{ rarity: kindKey, species: species, hatchAt: nowMs + kind.hatchMs }])
  };
}

// Indices of eggs whose hatch time has passed.
export function readyEggs(eggs, nowMs) {
  const list = Array.isArray(eggs) ? eggs : [];
  const out = [];
  for (let i = 0; i < list.length; i++) {
    if (list[i].hatchAt <= nowMs) out.push(i);
  }
  return out;
}

// Hatch one egg; returns updated state fields + hatched species, or null.
export function hatchEgg(state, eggIndex, nowMs) {
  const eggs = Array.isArray(state.eggs) ? state.eggs : [];
  if (eggIndex < 0 || eggIndex >= eggs.length) return null;
  const egg = eggs[eggIndex];
  if (egg.hatchAt > nowMs) return null;
  const kind = CONFIG.eggs.kinds[egg.rarity];
  const species = egg.species;
  const collection = Object.assign({}, state.collection);
  const hadBefore = (collection[species] || 0) > 0;
  collection[species] = (collection[species] || 0) + 1;
  const lightBonus = kind ? kind.lightBonus : 0;
  return {
    coins: state.coins,
    eggs: eggs.slice(0, eggIndex).concat(eggs.slice(eggIndex + 1)),
    collection: collection,
    starseedLight: Math.min(CONFIG.starseed.max, Math.max(0, state.starseedLight) + lightBonus),
    lightBonus: lightBonus,
    hatched: species,
    isNewSpecies: !hadBefore
  };
}
