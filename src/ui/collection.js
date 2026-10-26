// Collection journal bottom sheet: owned spirits, counts, active pet switch.

import { CONFIG } from '../data/config.js';

export function createCollection(handlers) {
  const sheet = document.getElementById('pets-sheet');
  const cards = document.getElementById('pets-cards');
  const closeBtn = document.getElementById('btn-close-pets');
  const built = {};

  const keys = Object.keys(CONFIG.species);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const sp = CONFIG.species[key];
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML =
      '<div class="card-title">' + sp.name + '</div>' +
      '<div class="card-sub">' + sp.title + '</div>' +
      '<div class="card-count"></div>' +
      '<button class="card-use"></button>';
    const useBtn = card.querySelector('.card-use');
    useBtn.addEventListener('click', function () { handlers.onSetActive(key); });
    cards.appendChild(card);
    built[key] = { card: card, useBtn: useBtn, count: card.querySelector('.card-count') };
  }

  function close() { sheet.hidden = true; }
  closeBtn.addEventListener('click', close);
  sheet.addEventListener('click', function (e) { if (e.target === sheet) close(); });

  function refresh(state) {
    const keys2 = Object.keys(built);
    for (let i = 0; i < keys2.length; i++) {
      const key = keys2[i];
      const b = built[key];
      const count = state.collection[key] || 0;
      b.count.textContent = count > 0 ? 'x' + count + ' hatched' : 'Undiscovered';
      b.card.classList.toggle('locked', count === 0 && state.activeSpecies !== key);
      b.useBtn.disabled = count === 0 && state.activeSpecies !== key;
      const active = state.activeSpecies === key;
      b.useBtn.textContent = active ? 'Active' : 'Make Active';
    }
  }

  function open(state) {
    refresh(state);
    sheet.hidden = false;
  }

  return { open: open, refresh: refresh };
}
