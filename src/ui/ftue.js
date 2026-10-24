// First-time intro sequence ("The Lost Starseed"): 3 skippable dialogue steps.
// Pure DOM overlay; the caller decides persistence of hasSeenIntro.

import { CONFIG } from '../data/config.js';

export function createFtue() {
  const steps = CONFIG.intro.steps;
  const els = {
    overlay: document.getElementById('intro-overlay'),
    title: document.getElementById('intro-title'),
    text: document.getElementById('intro-text'),
    next: document.getElementById('intro-next'),
    skip: document.getElementById('intro-skip')
  };

  let index = 0;
  let onDone = null;

  function show() {
    const step = steps[index];
    els.title.textContent = step.title;
    els.text.textContent = step.text;
    els.next.textContent = (index === steps.length - 1) ? 'Begin' : 'Next';
  }

  function close() {
    els.overlay.hidden = true;
    const cb = onDone;
    onDone = null;
    if (cb) cb();
  }

  els.next.addEventListener('click', function () {
    index += 1;
    if (index >= steps.length) {
      close();
    } else {
      show();
    }
  });
  els.skip.addEventListener('click', close);

  function open(done) {
    index = 0;
    onDone = done;
    show();
    els.overlay.hidden = false;
  }

  return { open: open };
}
