// PetVerse entry point: wires rendering, state, saves, audio, and UI.
// Vanilla ES modules, zero build step. Three.js loads from a CDN import map.

import { CONFIG } from './data/config.js';
import { createBus } from './core/bus.js';
import { createFsm } from './state/fsm.js';
import { createStats, applyEffects, applyOffline, addStarseedLight } from './gameplay/petStats.js';
import { levelFromXp, applyXp } from './gameplay/progression.js';
import { canBuyEgg, buyEgg, readyEggs, hatchEgg } from './gameplay/eggs.js';
import { createSave } from './state/save.js';
import { normalizeState, missingSettings } from './state/migrations.js';
import { createScene } from './render/scene.js';
import { createPet } from './render/pet.js';
import { createEggs } from './render/egg.js';
import { createAudio } from './core/audio.js';
import { createFtue } from './ui/ftue.js';
import { createFeedback } from './ui/feedback.js';
import { createEggShop } from './ui/eggShop.js';
import { createCollection } from './ui/collection.js';

// ---- event bus + state machine ----
const bus = createBus();
const fsm = createFsm(bus);

// ---- persistent state (backward compatible) ----
const save = createSave(window.localStorage);
const loaded = save.load();

let state;
if (loaded) {
  state = normalizeState(loaded.state);
  // first run of this build: honor the OS reduced-motion preference
  if (missingSettings(loaded.state) &&
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    state.settings.reducedMotion = true;
  }
  state.stats = applyOffline(state.stats, loaded.timestamp, Date.now());
} else {
  state = normalizeState({ coins: CONFIG.economy.startingCoins, stats: createStats() });
}

// ---- ui refs ----
const els = {
  coins: document.getElementById('coins'),
  coinChip: document.getElementById('coin-chip'),
  level: document.getElementById('level'),
  lightFill: document.getElementById('light-fill'),
  lightPct: document.getElementById('light-pct'),
  bars: {
    hunger: document.getElementById('bar-hunger'),
    happiness: document.getElementById('bar-happiness'),
    energy: document.getElementById('bar-energy')
  },
  buttons: {
    feed: document.getElementById('btn-feed'),
    play: document.getElementById('btn-play'),
    clean: document.getElementById('btn-clean')
  },
  nav: {
    shop: document.getElementById('btn-shop'),
    pets: document.getElementById('btn-pets'),
    islands: document.getElementById('btn-islands')
  },
  toasts: document.getElementById('toasts'),
  btnSettings: document.getElementById('btn-settings'),
  settingsSheet: document.getElementById('settings-sheet'),
  btnCloseSettings: document.getElementById('btn-close-settings'),
  toggleMute: document.getElementById('toggle-mute'),
  toggleReduced: document.getElementById('toggle-reduced')
};

function renderUi() {
  const keys = Object.keys(els.bars);
  for (let i = 0; i < keys.length; i++) {
    const v = state.stats[keys[i]];
    const el = els.bars[keys[i]];
    el.style.width = (typeof v === 'number' ? v : 0) + '%';
    if (v < CONFIG.stats.lowThreshold) el.classList.add('low');
    else el.classList.remove('low');
  }
  els.coins.textContent = String(Math.floor(state.coins));
  els.level.textContent = String(levelFromXp(state.xp));
  const pct = Math.round((state.starseedLight / CONFIG.starseed.max) * 100);
  els.lightFill.style.width = pct + '%';
  els.lightPct.textContent = pct + '%';
}

function coinPop() {
  els.coinChip.classList.remove('pop');
  void els.coinChip.offsetWidth; // restart the CSS animation
  els.coinChip.classList.add('pop');
}

function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  els.toasts.appendChild(el);
  setTimeout(function () { el.classList.add('show'); }, 10);
  setTimeout(function () {
    el.classList.remove('show');
    setTimeout(function () { el.remove(); }, 350);
  }, 2200);
}

// ---- rendering ----
const canvas = document.getElementById('scene');
const view = createScene(canvas);
const island = view.island;
let pet = createPet(view.scene, bus, state.activeSpecies);
const eggsView = createEggs(view.scene);

function setPet(speciesId) {
  pet.dispose();
  pet = createPet(view.scene, bus, speciesId);
  pet.setReducedMotion(state.settings.reducedMotion);
}

let last = performance.now();
function tick(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  pet.update(dt, now / 1000);
  island.update(dt, now / 1000, state.settings.reducedMotion);
  eggsView.sync(state.eggs, now);
  eggsView.update(dt, now / 1000, state.settings.reducedMotion);
  tryHatch(now);
  view.render();
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

// ---- audio (procedural, optional) ----
const audio = createAudio();
document.addEventListener('pointerdown', function () { audio.unlock(); });

// ---- floating feedback ----
const feedback = createFeedback(document.getElementById('feedback-layer'));

// ---- settings ----
function applySettings() {
  const s = state.settings;
  audio.setMuted(s.muted);
  document.body.classList.toggle('reduced-motion', s.reducedMotion);
  pet.setReducedMotion(s.reducedMotion);
  els.toggleMute.textContent = 'Sound: ' + (s.muted ? 'Off' : 'On');
  els.toggleReduced.textContent = 'Reduced Motion: ' + (s.reducedMotion ? 'On' : 'Off');
}

els.btnSettings.addEventListener('click', function () {
  els.settingsSheet.hidden = false;
  audio.play('ui');
});
els.btnCloseSettings.addEventListener('click', function () {
  els.settingsSheet.hidden = true;
});
els.settingsSheet.addEventListener('click', function (e) {
  if (e.target === els.settingsSheet) els.settingsSheet.hidden = true;
});
els.toggleMute.addEventListener('click', function () {
  state.settings.muted = !state.settings.muted;
  applySettings();
  audio.play('ui');
  scheduleSave();
});
els.toggleReduced.addEventListener('click', function () {
  state.settings.reducedMotion = !state.settings.reducedMotion;
  applySettings();
  audio.play('ui');
  scheduleSave();
});

// ---- actions ----
const cooldowns = {};

function doAction(name) {
  if (!fsm.can()) return;
  const now = Date.now();
  if (cooldowns[name] !== undefined && now < cooldowns[name]) return;

  const def = CONFIG.actions[name];
  fsm.to('acting');
  pet.react(name);
  state.stats = applyEffects(state.stats, def.effects);
  state.starseedLight = addStarseedLight(state.starseedLight, CONFIG.starseed.lightPerAction);
  island.setGlow(state.starseedLight / CONFIG.starseed.max);

  // xp + level-ups
  const prog = applyXp(state.xp, CONFIG.xp.perAction);
  state.xp = prog.xp;
  if (prog.levels > 0) {
    state.coins += prog.coins;
    toast('Level ' + prog.level + '! +' + prog.coins + ' coins');
    audio.play('levelup');
    coinPop();
  }

  audio.play(name);
  feedback.pop('+' + CONFIG.starseed.lightPerAction + ' Light', 'light');

  cooldowns[name] = now + def.cooldownMs;
  const btn = els.buttons[name];
  btn.disabled = true;
  setTimeout(function () { btn.disabled = false; }, def.cooldownMs);

  renderUi();
  fsm.to('idle');
  scheduleSave();
}

els.buttons.feed.addEventListener('click', function () { doAction('feed'); });
els.buttons.play.addEventListener('click', function () { doAction('play'); });
els.buttons.clean.addEventListener('click', function () { doAction('clean'); });

// ---- egg shop + hatching ----
const eggShop = createEggShop({
  onBuy: function (kindKey) {
    const result = buyEgg(state, kindKey, Date.now());
    if (!result) {
      const kind = CONFIG.eggs.kinds[kindKey];
      if (state.coins < kind.cost) toast('Not enough coins');
      else if (state.eggs.length >= CONFIG.eggs.maxEggs) toast('Nest is full - hatch an egg first');
      audio.play('ui');
      return;
    }
    state.coins = result.coins;
    state.eggs = result.eggs;
    audio.play('ui');
    coinPop();
    toast(CONFIG.eggs.kinds[kindKey].label + ' is incubating');
    eggShop.refresh(state);
    renderUi();
    doSave();
  }
});

function tryHatch(nowMs) {
  if (state.eggs.length === 0) return;
  const ready = readyEggs(state.eggs, nowMs);
  if (ready.length === 0) return;
  const result = hatchEgg(state, ready[0], nowMs);
  if (!result) return;
  state.eggs = result.eggs;
  state.collection = result.collection;
  state.starseedLight = result.starseedLight;
  island.setGlow(state.starseedLight / CONFIG.starseed.max);
  const sp = CONFIG.species[result.hatched];
  audio.play('hatch');
  feedback.pop('+' + result.lightBonus + ' Light', 'light');
  toast(result.isNewSpecies
    ? 'New spirit hatched: ' + sp.name + '!'
    : sp.name + ' hatched!');
  if (result.isNewSpecies) feedback.pop('New spirit: ' + sp.name, 'star');
  renderUi();
  doSave();
}

// ---- collection journal ----
const collection = createCollection({
  onSetActive: function (speciesId) {
    if (speciesId === state.activeSpecies) return;
    if (!(state.collection[speciesId] > 0)) return;
    state.activeSpecies = speciesId;
    setPet(speciesId);
    pet.react('play');
    audio.play('ui');
    toast(CONFIG.species[speciesId].name + ' is now your active spirit');
    collection.refresh(state);
    doSave();
  }
});

// ---- navigation ----
els.nav.shop.addEventListener('click', function () {
  audio.play('ui');
  eggShop.open(state);
});
els.nav.pets.addEventListener('click', function () {
  audio.play('ui');
  collection.open(state);
});
els.nav.islands.addEventListener('click', function () {
  toast('Islands awaken in a future update');
});

// ---- first-time intro ("The Lost Starseed") ----
const ftue = createFtue();
if (!state.hasSeenIntro) {
  ftue.open(function () {
    state.hasSeenIntro = true;
    doSave();
  });
}

// ---- saving ----
let saveTimer = null;

function doSave() {
  save.save(state);
}

function scheduleSave() {
  if (saveTimer !== null) return;
  saveTimer = setTimeout(function () {
    saveTimer = null;
    doSave();
  }, 5000);
}

setInterval(doSave, CONFIG.save.autosaveMs);
document.addEventListener('visibilitychange', function () {
  if (document.hidden) doSave();
});
window.addEventListener('pagehide', doSave);

// ---- PWA (optional offline support) ----
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('./sw.js').catch(function () { /* offline is optional */ });
  });
}

// ---- boot ----
island.setGlow(state.starseedLight / CONFIG.starseed.max);
applySettings();
renderUi();
