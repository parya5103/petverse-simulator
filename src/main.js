// PetVerse entry point: wires rendering, state, saves, and UI.
// Vanilla ES modules, zero build step. Three.js loads from a CDN import map.

import { CONFIG } from './data/config.js';
import { createBus } from './core/bus.js';
import { createFsm } from './state/fsm.js';
import { createStats, applyEffects, applyOffline } from './gameplay/petStats.js';
import { createSave } from './state/save.js';
import { createScene } from './render/scene.js';
import { createPet } from './render/pet.js';

// ---- event bus + state machine ----
const bus = createBus();
const fsm = createFsm(bus);

// ---- persistent state ----
const save = createSave(window.localStorage);
const loaded = save.load();

const state = {
  coins: loaded ? loaded.state.coins : CONFIG.economy.startingCoins,
  stats: createStats()
};
if (loaded) state.stats = Object.assign(state.stats, loaded.state.stats);
state.stats = applyOffline(state.stats, loaded ? loaded.timestamp : Date.now(), Date.now());

// ---- ui refs ----
const els = {
  coins: document.getElementById('coins'),
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
  toasts: document.getElementById('toasts')
};

function renderUi() {
  const keys = Object.keys(els.bars);
  for (let i = 0; i < keys.length; i++) {
    const v = state.stats[keys[i]];
    els.bars[keys[i]].style.width = (typeof v === 'number' ? v : 0) + '%';
  }
  els.coins.textContent = String(Math.floor(state.coins));
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
const pet = createPet(view.scene, bus);

let last = performance.now();
function tick(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  pet.update(dt, now / 1000);
  view.render();
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

// ---- actions ----
const cooldowns = {};

function doAction(name) {
  if (!fsm.can()) return;
  const now = Date.now();
  if (cooldowns[name] !== undefined && now < cooldowns[name]) return;

  const def = CONFIG.actions[name];
  fsm.to('acting');
  pet.startHop();
  state.stats = applyEffects(state.stats, def.effects);
  cooldowns[name] = now + def.cooldownMs;

  const btn = els.buttons[name];
  btn.disabled = true;
  setTimeout(function () { btn.disabled = false; }, def.cooldownMs);

  renderUi();
  toast(def.label + '!');
  fsm.to('idle');
  scheduleSave();
}

els.buttons.feed.addEventListener('click', function () { doAction('feed'); });
els.buttons.play.addEventListener('click', function () { doAction('play'); });
els.buttons.clean.addEventListener('click', function () { doAction('clean'); });

// ---- saving ----
let saveTimer = null;

function doSave() {
  save.save({ coins: state.coins, stats: state.stats });
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

// ---- boot ----
renderUi();
