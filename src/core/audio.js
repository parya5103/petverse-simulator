// Tiny procedural audio: synthesized tones via Web Audio API.
// No audio files, no assets. Fully optional - game must be playable muted.

import { CONFIG } from '../data/config.js';

export function createAudio() {
  let ctx = null;
  let muted = false;

  // must be called from a user gesture (autoplay policy)
  function unlock() {
    if (ctx) {
      if (ctx.state === 'suspended') ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
  }

  function tone(step, type) {
    const t0 = ctx.currentTime + (step.delay || 0);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = step.f;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(step.v, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + step.d);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + step.d + 0.05);
  }

  function play(name) {
    if (!ctx || muted) return;
    const sound = CONFIG.audio.sounds[name];
    if (!sound) return;
    for (let i = 0; i < sound.steps.length; i++) tone(sound.steps[i], sound.type);
  }

  return {
    unlock: unlock,
    play: play,
    setMuted: function (m) { muted = m === true; },
    get muted() { return muted; }
  };
}
