// Procedural Spirit Pet (Lumipup): primitives only, zero external assets.
// Idle breathing + blinking + ear twitches + distinct action reactions.
// Reduced motion disables spins/shakes but keeps subtle idle life.

import * as THREE from 'three';
import { CONFIG } from '../data/config.js';

export function createPet(scene, bus) {
  const P = CONFIG.pet;
  const group = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xffb347, roughness: 0.6 });

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.8, 24, 18), bodyMat);
  body.scale.set(1, 0.92, 1);
  body.position.y = 0.85;
  group.add(body);

  const earGeo = new THREE.ConeGeometry(0.22, 0.5, 12);
  const earL = new THREE.Mesh(earGeo, bodyMat);
  earL.position.set(-0.42, 1.5, 0);
  earL.rotation.z = 0.35;
  group.add(earL);
  const earR = earL.clone();
  earR.position.x = 0.42;
  earR.rotation.z = -0.35;
  group.add(earR);

  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
  const eyeGeo = new THREE.SphereGeometry(0.09, 12, 10);
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  eyeL.position.set(-0.28, 1.0, 0.72);
  group.add(eyeL);
  const eyeR = eyeL.clone();
  eyeR.position.x = 0.28;
  group.add(eyeR);

  const snout = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 12, 10),
    new THREE.MeshStandardMaterial({ color: 0xfff1d0 })
  );
  snout.position.set(0, 0.78, 0.74);
  snout.scale.set(1, 0.8, 0.7);
  group.add(snout);

  scene.add(group);

  let reducedMotion = false;

  // hop state
  const HOP_TIME = 0.5;
  let hopT = -1; // -1 = not hopping

  // idle life timers
  function randRange(min, max) { return min + Math.random() * (max - min); }
  let blinkTimer = randRange(P.blinkMinMs, P.blinkMaxMs) / 1000;
  let blinkLeft = 0;
  let earTimer = randRange(P.earTwitchMinMs, P.earTwitchMaxMs) / 1000;
  let earTwitchLeft = 0;
  const earBaseZ = earR.rotation.z;

  // action reaction state
  let reaction = null; // { kind, t, dur }

  function startHop() {
    if (hopT < 0) hopT = 0;
  }

  function react(kind) {
    if (kind === 'play') startHop();
    reaction = { kind: kind, t: 0, dur: P.reactionMs[kind] / 1000 };
  }

  function setReducedMotion(v) {
    reducedMotion = v === true;
  }

  function update(dt, t) {
    // idle breathing (subtle enough to keep with reduced motion)
    const breathe = 1 + Math.sin(t * 2.2) * 0.02;
    body.scale.y = 0.92 * breathe;

    // blinking
    blinkTimer -= dt;
    if (blinkTimer <= 0 && blinkLeft <= 0) {
      blinkLeft = P.blinkDurationMs / 1000;
      blinkTimer = randRange(P.blinkMinMs, P.blinkMaxMs) / 1000;
    }
    if (blinkLeft > 0) {
      blinkLeft -= dt;
      const closed = blinkLeft > 0;
      eyeL.scale.y = closed ? 0.08 : 1;
      eyeR.scale.y = closed ? 0.08 : 1;
    } else if (eyeL.scale.y !== 1) {
      eyeL.scale.y = 1;
      eyeR.scale.y = 1;
    }

    // ear twitch
    earTimer -= dt;
    if (earTimer <= 0 && earTwitchLeft <= 0) {
      earTwitchLeft = P.earTwitchDurationMs / 1000;
      earTimer = randRange(P.earTwitchMinMs, P.earTwitchMaxMs) / 1000;
    }
    if (earTwitchLeft > 0) {
      earTwitchLeft -= dt;
      const q = 1 - earTwitchLeft / (P.earTwitchDurationMs / 1000);
      earR.rotation.z = earBaseZ + Math.sin(q * Math.PI) * 0.3;
    } else if (earR.rotation.z !== earBaseZ) {
      earR.rotation.z = earBaseZ;
    }

    // hop with squash-and-stretch
    if (hopT >= 0) {
      hopT += dt;
      const p = Math.min(1, hopT / HOP_TIME);
      let sy = 1;
      let y = 0;
      if (p < 0.15) {
        sy = 1 - 0.25 * (p / 0.15);
      } else if (p < 0.7) {
        const q = (p - 0.15) / 0.55;
        y = Math.sin(q * Math.PI) * 1.1;
        sy = 1 + 0.15 * Math.sin(q * Math.PI);
      } else {
        const q = (p - 0.7) / 0.3;
        sy = 1 - 0.15 * Math.sin(q * Math.PI);
      }
      const inv = 1 / Math.sqrt(sy);
      group.position.y = y;
      group.scale.set(inv, sy, inv);
      if (p >= 1) {
        hopT = -1;
        group.position.y = 0;
        group.scale.set(1, 1, 1);
        if (bus) bus.emit('pet-hop-done');
      }
    }

    // action reactions
    if (reaction) {
      reaction.t += dt;
      const p = Math.min(1, reaction.t / reaction.dur);
      if (reaction.kind === 'feed') {
        // happy nod/chomp
        group.rotation.x = Math.sin(p * Math.PI * 2) * 0.14;
      } else if (reaction.kind === 'play') {
        // joyful spin (skip for reduced motion)
        if (!reducedMotion) group.rotation.y = p * P.spinTurns * Math.PI * 2;
      } else if (reaction.kind === 'clean') {
        // sparkle shake (skip for reduced motion)
        if (!reducedMotion) group.position.x = Math.sin(p * Math.PI * P.shakeWobble) * 0.06 * (1 - p);
      }
      if (p >= 1) {
        group.rotation.x = 0;
        group.rotation.y = 0;
        group.position.x = 0;
        reaction = null;
      }
    }
  }

  return {
    group: group,
    update: update,
    startHop: startHop,
    react: react,
    setReducedMotion: setReducedMotion
  };
}
