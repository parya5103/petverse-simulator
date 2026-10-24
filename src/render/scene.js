// Three.js scene with a drag-to-orbit camera rig.
// Kept small for low-end Android: few lights, few meshes, pixel ratio cap.

import * as THREE from 'three';
import { CONFIG } from '../data/config.js';
import { createIsland } from './island.js';

export function createScene(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, CONFIG.render.maxPixelRatio));

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);
  scene.fog = new THREE.Fog(0x87ceeb, 14, 26);

  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);

  // orbit rig: spherical coordinates around the pet
  const rig = {
    radius: 5.2,
    theta: Math.PI / 5,
    phi: Math.PI / 3.2,
    minPhi: 0.35,
    maxPhi: 1.25,
    minRadius: 3.5,
    maxRadius: 8
  };
  const target = new THREE.Vector3(0, 0.9, 0);

  function applyRig() {
    const sinPhi = Math.sin(rig.phi);
    camera.position.set(
      target.x + rig.radius * sinPhi * Math.sin(rig.theta),
      target.y + rig.radius * Math.cos(rig.phi),
      target.z + rig.radius * sinPhi * Math.cos(rig.theta)
    );
    camera.lookAt(target);
  }

  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const hemi = new THREE.HemisphereLight(0xbfe3ff, 0x6fbf73, 0.5);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff3d6, 1.0);
  sun.position.set(4, 7, 3);
  scene.add(sun);

  const ground = new THREE.Mesh(
    new THREE.CylinderGeometry(9, 9, 0.4, 32),
    new THREE.MeshStandardMaterial({ color: 0x6fbf73 })
  );
  ground.position.y = -0.2;
  scene.add(ground);

  // water disc floating far below the island
  const water = new THREE.Mesh(
    new THREE.CylinderGeometry(13, 13, 0.25, 32),
    new THREE.MeshStandardMaterial({ color: 0x3f8fc4, roughness: 0.35 })
  );
  water.position.y = -1.6;
  scene.add(water);

  // Starter Sanctuary: shrine crystal, bobbing rocks, light motes
  const island = createIsland(scene);

  // drag-to-orbit input (pointer events cover touch + mouse)
  let dragging = false;
  let lastX = 0;
  let lastY = 0;

  canvas.addEventListener('pointerdown', function (e) {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* capture is optional */ }
  });
  canvas.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    rig.theta -= dx * 0.008;
    const phi = rig.phi - dy * 0.006;
    rig.phi = Math.min(rig.maxPhi, Math.max(rig.minPhi, phi));
    applyRig();
  });
  function endDrag() { dragging = false; }
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);

  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);

  applyRig();
  resize();

  function render() {
    renderer.render(scene, camera);
  }

  function dispose() {
    window.removeEventListener('resize', resize);
    renderer.dispose();
  }

  return { scene: scene, camera: camera, renderer: renderer, rig: rig, target: target, island: island, resize: resize, render: render, dispose: dispose };
}
