// Egg Shop bottom sheet: one card per egg kind, live affordability.
// All numbers come from config. DOM built once, refreshed on open/buy.

import { CONFIG } from '../data/config.js';

export function createEggShop(handlers) {
  const sheet = document.getElementById('shop-sheet');
  const cards = document.getElementById('shop-cards');
  const closeBtn = document.getElementById('btn-close-shop');
  const built = [];

  const keys = Object.keys(CONFIG.eggs.kinds);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const kind = CONFIG.eggs.kinds[key];
    const oddsText = Object.keys(kind.odds).map(function (s) {
      return Math.round(kind.odds[s] * 100) + '% ' + CONFIG.species[s].name;
    }).join(' / ');

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML =
      '<div class="card-title">' + kind.label + '</div>' +
      '<div class="card-sub">' + oddsText + '</div>' +
      '<div class="card-sub">Hatch time: ' + (kind.hatchMs / 60000) + ' min</div>' +
      '<button class="card-buy">' + kind.cost + ' coins</button>';
    const buyBtn = card.querySelector('.card-buy');
    buyBtn.addEventListener('click', function () { handlers.onBuy(key); });
    cards.appendChild(card);
    built.push({ key: key, buyBtn: buyBtn });
  }

  function close() { sheet.hidden = true; }
  closeBtn.addEventListener('click', close);
  sheet.addEventListener('click', function (e) { if (e.target === sheet) close(); });

  function refresh(state) {
    for (let i = 0; i < built.length; i++) {
      const b = built[i];
      const kind = CONFIG.eggs.kinds[b.key];
      b.buyBtn.disabled = !(state.coins >= kind.cost && state.eggs.length < CONFIG.eggs.maxEggs);
    }
  }

  function open(state) {
    refresh(state);
    sheet.hidden = false;
  }

  return { open: open, refresh: refresh };
}
