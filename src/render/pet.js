// Procedural Spirit Pets: 3 species from primitives, zero external assets.
// Lumipup (ember), Dewdrop (aqua-sprout), Starling (astral).
// Idle life: breathing, blinking, ear/leaf/antenna twitches, species sway.
// Reduced motion disables spins/shakes but keeps subtle idle life.

import * as THREE from 'three';
import { CONFIG } from '../data/config.js';

export function createPet(scene, bus, speciesId) {
  const S = CONFIG.species[speciesId] || CONFIG.species[CONFIG.eggs.starterSpecies];
  const P = CONFIG.pet;
  const group = new THREE.Group();
  const disposables = [];

  function track(o) { disposables.push(o); return o; }

  const bodyMat = track(new THREE.MeshStandardMaterial({ color: S.bodyColor, roughness: 0.6 }));
  const bodyGeo = track(new THREE.SphereGeometry(0.8, 24, 18));
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.scale.set(1, 0.92, 1);
  body.position.y = 0.85;
  group.add(body);

  const eyeMat = track(new THREE.MeshStandardMaterial({ color: 0x222222 }));
  const eyeGeo = track(new THREE.SphereGeometry(0.09, 12, 10));
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  eyeL.position.set(-0.28, 1.0, 0.72);
  group.add(eyeL);
  const eyeR = eyeL.clone();
  eyeR.position.x = 0.28;
  group.add(eyeR);

  let earR = null;
  let earBaseZ = 0;
  let gem = null;
  let antennaTips = [];

  if (S.id === 'lumipup') {
    // tall cone ears + cream snout
    const earGeo = track(new THREE.ConeGeometry(0.22, 0.5, 12));
    const earL = new THREE.Mesh(earGeo, bodyMat);
    earL.position.set(-0.42, 1.5, 0);
    earL.rotation.z = 0.35;
    group.add(earL);
    earR = earL.clone();
    earR.position.x = 0.42;
    earR.rotation.z = -0.35;
    earBaseZ = earR.rotation.z;
    group.add(earR);

    const snout = new THREE.Mesh(
      track(new THREE.SphereGeometry(0.16, 12, 10)),
      track(new THREE.MeshStandardMaterial({ color: S.snoutColor }))
    );
    snout.position.set(0, 0.78, 0.74);
    snout.scale.set(1, 0.8, 0.7);
    group.add(snout);
  } else if (S.id === 'dewdrop') {
    // droplet-leaning body, leaf sprout, side flippers
    body.scale.set(0.95, 1.06, 0.95);
    const leaf = new THREE.Mesh(
      track(new THREE.ConeGeometry(0.14, 0.42, 8)),
      track(new THREE.MeshStandardMaterial({ color: S.leafColor, roughness: 0.7 }))
    );
    leaf.position.set(0.08, 1.72, 0);
    leaf.rotation.z = -0.5;
    group.add(leaf);
    earR = leaf; // leaf does the idle twitch
    earBaseZ = leaf.rotation.z;

    const flipGeo = track(new THREE.SphereGeometry(0.3, 12, 10));
    const flipL = new THREE.Mesh(flipGeo, bodyMat);
    flipL.position.set(-0.78, 0.55, 0);
    flipL.scale.set(0.4, 0.5, 0.9);
    group.add(flipL);
    const flipR = flipL.clone();
    flipR.position.x = 0.78;
    group.add(flipR);
  } else if (S.id === 'starling') {
    // curved antennae with glowing tips + star gem
    const antGeo = track(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8));
    const tipGeo = track(new THREE.SphereGeometry(0.08, 10, 8));
    const tipMat = track(new THREE.MeshStandardMaterial({ color: S.tipColor, emissive: S.tipColor, emissiveIntensity: 0.9 }));
    const antL = new THREE.Mesh(antGeo, bodyMat);
    antL.position.set(-0.35, 1.65, 0);
    antL.rotation.z = 0.3;
    group.add(antL);
    const antR = antL.clone();
    antR.position.x = 0.35;
    antR.rotation.z = -0.3;
    group.add(antR);
    const tipL = new THREE.Mesh(tipGeo, tipMat);
    tipL.position.set(-0.44, 1.88, 0);
    group.add(tipL);
    const tipR = tipL.clone();
    tipR.position.x = 0.44;
    group.add(tipR);
    antennaTips = [tipL, tipR];

    gem = new THREE.Mesh(
      track(new THREE.OctahedronGeometry(0.12, 0)),
      track(new THREE.MeshStandardMaterial({ color: S.gemColor, emissive: S.gemColor, emissiveIntensity: 0.8 }))
    );
    gem.position.set(0, 1.12, 0.72);
    group.add(gem);
    earR = antR; // antenna does the idle twitch
    earBaseZ = antR.rotation.z;
  }

  scene.add(group);

  let reducedMotion = false;

  // hop state
  const HOP_TIME = 0.5;
  let hopT = -1;

  // idle life timers
  function randRange(min, max) { return min + Math.random() * (max - min); }
  let blinkTimer = randRange(P.blinkMinMs, P.blinkMaxMs) / 1000;
  let blinkLeft = 0;
  let earTimer = randRange(P.earTwitchMinMs, P.earTwitchMaxMs) / 1000;
  let earTwitchLeft = 0;

  // action reaction state
  let reaction = null;

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
    body.scale.y = 0.92 * breathe * (S.id === 'dewdrop' ? 1.15 : 1);

    // species floaty sway (owns group.position.x when nothing else is)
    const swayAmp = reducedMotion ? 0 : S.idleSwayAmp;
    const bobAmp = reducedMotion ? 0 : S.idleBobAmp;
    if (hopT < 0 && !reaction) {
      group.position.x = Math.sin(t * 0.9) * swayAmp;
      group.position.y = Math.sin(t * S.idleBobSpeed) * bobAmp;
    }

    // blinking
    blinkTimer -= dt;
    if (blinkTimer <= 0 && blinkLeft <= 0) {
      blinkLeft = P.blinkDurationMs / 1000;
      blinkTimer = randRange(P.blinkMinMs, P.blinkMaxMs) / 1000;
    }
    if (blinkLeft > 0) {
      blinkLeft -= dt;
      eyeL.scale.y = 0.08;
      eyeR.scale.y = 0.08;
    } else if (eyeL.scale.y !== 1) {
      eyeL.scale.y = 1;
      eyeR.scale.y = 1;
    }

    // ear / leaf / antenna twitch
    if (earR) {
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
    }

    // astral glow pulse
    if (gem) {
      const pulse = 0.6 + Math.sin(t * 2.4) * 0.25;
      gem.material.emissiveIntensity = pulse;
      for (let i = 0; i < antennaTips.length; i++) {
        antennaTips[i].material.emissiveIntensity = pulse;
      }
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
        group.rotation.x = Math.sin(p * Math.PI * 2) * 0.14;
      } else if (reaction.kind === 'play') {
        if (!reducedMotion) group.rotation.y = p * P.spinTurns * Math.PI * 2;
      } else if (reaction.kind === 'clean') {
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

  function dispose() {
    scene.remove(group);
    for (let i = 0; i < disposables.length; i++) disposables[i].dispose();
  }

  return {
    group: group,
    update: update,
    startHop: startHop,
    react: react,
    setReducedMotion: setReducedMotion,
    dispose: dispose
  };
}
