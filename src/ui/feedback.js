// Floating action feedback: "+2 Light" popups rising from the action dock.
// Pure DOM + CSS animation; numbers in config.

import { CONFIG } from '../data/config.js';

export function createFeedback(layer) {
  function pop(text, kind) {
    const el = document.createElement('div');
    el.className = 'feedback ' + (kind || '');
    el.textContent = text;
    layer.appendChild(el);
    setTimeout(function () { el.remove(); }, CONFIG.feedback.durationMs + 400);
  }

  return { pop: pop };
}
