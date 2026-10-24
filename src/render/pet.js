// Procedural pet built from primitives - zero external assets.
// Idle breathing + hop animation with squash-and-stretch.

import * as THREE from 'three';

export function createPet(scene, bus) {
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

  const HOP_TIME = 0.5;
  let hopT = -1; // -1 = not hopping

  function startHop() {
    if (hopT < 0) hopT = 0;
  }

  function update(dt, t) {
    // idle breathing
    const breathe = 1 + Math.sin(t * 2.2) * 0.02;
    body.scale.y = 0.92 * breathe;

    if (hopT < 0) return;

    hopT += dt;
    const p = Math.min(1, hopT / HOP_TIME);

    let sy = 1;
    let y = 0;
    if (p < 0.15) {
      sy = 1 - 0.25 * (p / 0.15); // anticipation squash
    } else if (p < 0.7) {
      const q = (p - 0.15) / 0.55;
      y = Math.sin(q * Math.PI) * 1.1; // arc
      sy = 1 + 0.15 * Math.sin(q * Math.PI); // mid-air stretch
    } else {
      const q = (p - 0.7) / 0.3;
      sy = 1 - 0.15 * Math.sin(q * Math.PI); // landing squash, then settle
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

  return { group: group, update: update, startHop: startHop };
}
