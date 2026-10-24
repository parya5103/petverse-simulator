// Starter Sanctuary: shrine crystal centerpiece, bobbing rocks, floating light motes.
// 100% procedural geometry. Glow level is driven by Starseed Light progress.

import * as THREE from 'three';
import { CONFIG } from '../data/config.js';

export function createIsland(scene) {
  const cfg = CONFIG.island;

  // shrine crystal
  const crystalMat = new THREE.MeshStandardMaterial({
    color: 0x9ad7ff,
    emissive: 0x66c2ff,
    emissiveIntensity: cfg.crystalEmissiveMin,
    roughness: 0.2,
    metalness: 0.1
  });
  const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.55, 0), crystalMat);
  crystal.position.set(0, 1.45, -2.6);
  scene.add(crystal);

  const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.75, 0.6, 8),
    new THREE.MeshStandardMaterial({ color: 0x8a7f6d, roughness: 0.9 })
  );
  pedestal.position.set(0, -0.1, -2.6);
  scene.add(pedestal);

  // gently bobbing floating rocks
  const rockGeo = new THREE.DodecahedronGeometry(0.3, 0);
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x9c9484, roughness: 0.9 });
  const rocks = [];
  for (let i = 0; i < cfg.rockCount; i++) {
    const rock = new THREE.Mesh(rockGeo, rockMat);
    const a = (i / cfg.rockCount) * Math.PI * 2 + 0.6;
    rock.position.set(Math.cos(a) * 3.4, 1.4 + i * 0.5, Math.sin(a) * 3.4 - 1.0);
    rock.userData.phase = i * 2.1;
    scene.add(rock);
    rocks.push(rock);
  }

  // floating light motes (single Points draw call)
  const n = cfg.moteCount;
  const positions = new Float32Array(n * 3);
  const base = [];
  for (let i = 0; i < n; i++) {
    const ang = Math.random() * Math.PI * 2;
    const rad = 1.2 + Math.random() * cfg.moteSpread;
    const y = cfg.moteHeightMin + Math.random() * (cfg.moteHeightMax - cfg.moteHeightMin);
    base.push({ x: Math.cos(ang) * rad, y: y, z: Math.sin(ang) * rad, phase: Math.random() * Math.PI * 2 });
    positions[i * 3] = base[i].x;
    positions[i * 3 + 1] = base[i].y;
    positions[i * 3 + 2] = base[i].z;
  }
  const moteGeo = new THREE.BufferGeometry();
  moteGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const moteMat = new THREE.PointsMaterial({
    color: 0xfff2b0,
    size: cfg.moteSize,
    transparent: true,
    opacity: cfg.moteOpacityMin,
    depthWrite: false
  });
  const motes = new THREE.Points(moteGeo, moteMat);
  scene.add(motes);

  // glow: 0 (dim) .. 1 (restored)
  function setGlow(p) {
    const q = Math.min(1, Math.max(0, p));
    crystalMat.emissiveIntensity = cfg.crystalEmissiveMin + q * (cfg.crystalEmissiveMax - cfg.crystalEmissiveMin);
    moteMat.opacity = cfg.moteOpacityMin + q * (cfg.moteOpacityMax - cfg.moteOpacityMin);
  }

  function update(dt, t, reducedMotion) {
    if (!reducedMotion) crystal.rotation.y += dt * cfg.crystalSpin;
    crystal.position.y = 1.45 + Math.sin(t * 1.4) * 0.08;

    for (let i = 0; i < rocks.length; i++) {
      const r = rocks[i];
      r.position.y = 1.4 + i * 0.5 + Math.sin(t * cfg.rockBobSpeed + r.userData.phase) * cfg.rockBobAmp;
      if (!reducedMotion) r.rotation.y += dt * 0.2;
    }

    const pos = moteGeo.getAttribute('position');
    const amp = reducedMotion ? 0 : cfg.moteBobAmp;
    for (let i = 0; i < n; i++) {
      pos.array[i * 3 + 1] = base[i].y + Math.sin(t * cfg.moteBobSpeed + base[i].phase) * amp;
    }
    pos.needsUpdate = true;
  }

  return { update: update, setGlow: setGlow };
}
