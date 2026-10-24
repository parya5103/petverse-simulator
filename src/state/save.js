// Versioned save envelope with primary + backup keys.
// Storage is injected so tests can pass a fake.

import { CONFIG } from '../data/config.js';

export function createSave(storage) {
  const cfg = CONFIG.save;

  function serialize(state, nowMs) {
    return JSON.stringify({ version: cfg.version, timestamp: nowMs, state: state });
  }

  function save(state, nowMs) {
    const ts = nowMs === undefined ? Date.now() : nowMs;
    // keep the previous good save as backup before overwriting primary
    const prev = storage.getItem(cfg.key);
    if (prev !== null) storage.setItem(cfg.backupKey, prev);
    storage.setItem(cfg.key, serialize(state, ts));
  }

  function load(nowMs) {
    const ts = nowMs === undefined ? Date.now() : nowMs;
    const order = [cfg.key, cfg.backupKey];
    for (let i = 0; i < order.length; i++) {
      const raw = storage.getItem(order[i]);
      if (raw === null) continue;
      let env = null;
      try { env = JSON.parse(raw); } catch (e) { env = null; }
      if (env === null || typeof env !== 'object') continue;
      if (typeof env.version !== 'number' || typeof env.timestamp !== 'number') continue;
      if (env.version > cfg.version) continue; // future save: refuse
      if (env.state === null || typeof env.state !== 'object') continue;
      if (typeof env.state.coins !== 'number' || !Number.isFinite(env.state.coins)) continue;
      const stats = env.state.stats;
      if (stats === null || typeof stats !== 'object') continue;
      return {
        version: env.version,
        timestamp: env.timestamp,
        state: Object.assign({}, env.state),
        loadedFrom: order[i],
        offlineMs: Math.max(0, ts - env.timestamp)
      };
    }
    return null;
  }

  function clear() {
    storage.removeItem(cfg.key);
    storage.removeItem(cfg.backupKey);
  }

  return { save, load, clear };
}
