// Incubating egg meshes: one shared geometry, one material per rarity,
// slots near the shrine. Ready eggs pulse. Synced against state each frame.

import * as THREE from 'three';
import { CONFIG } from '../data/config.js';

export function createEggs(scene) {
  const slots = [
    { x: -2.4, z: 1.7 },
    { x: -1.5, z: 2.2 },
    { x: -0.6, z: 1.7 }
  ];
  const geo = new THREE.SphereGeometry(0.38, 16, 14);
  const mats = {};
  let meshes = [];

  function materialFor(rarity) {
    if (!mats[rarity]) {
      const kind = CONFIG.eggs.kinds[rarity];
      mats[rarity] = new THREE.MeshStandardMaterial({
        color: kind ? kind.shellColor : 0xf5e6c8,
        emissive: kind ? kind.glowColor : 0xfff2b0,
        emissiveIntensity: 0.25,
        roughness: 0.5
      });
    }
    return mats[rarity];
  }

  // state.eggs is authoritative; meshes follow it
  function sync(eggs, nowMs) {
    const list = Array.isArray(eggs) ? eggs : [];
    while (meshes.length < list.length) {
      const m = new THREE.Mesh(geo, materialFor(list[meshes.length].rarity));
      scene.add(m);
      meshes.push(m);
    }
    while (meshes.length > list.length) {
      scene.remove(meshes.pop());
    }
    for (let i = 0; i < meshes.length; i++) {
      meshes[i].userData.ready = list[i].hatchAt <= nowMs;
    }
  }

  function update(dt, t, reducedMotion) {
    const amp = reducedMotion ? 0 : 1;
    for (let i = 0; i < meshes.length; i++) {
      const m = meshes[i];
      m.position.set(slots[i].x, 0.55 + Math.sin(t * 1.5 + i) * 0.06 * amp, slots[i].z);
      m.rotation.z = Math.sin(t * 1.2 + i) * 0.08 * amp;
      const ready = m.userData.ready;
      const s = ready ? 1 + Math.sin(t * 6) * 0.06 : 1;
      m.scale.set(1.15 * s, 1.35 * s, 1.15 * s);
      m.material.emissiveIntensity = ready ? 0.7 + Math.sin(t * 6) * 0.3 : 0.25;
    }
  }

  function dispose() {
    for (let i = 0; i < meshes.length; i++) scene.remove(meshes[i]);
    meshes = [];
    const keys = Object.keys(mats);
    for (let i = 0; i < keys.length; i++) mats[keys[i]].dispose();
    geo.dispose();
  }

  return { sync: sync, update: update, dispose: dispose };
}
