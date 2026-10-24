// PetVerse Simulator - Phase 0 skeleton
// Mobile-first 3D pet sim. Three.js via CDN import map, zero build step.
// Architecture reference: TIDELINE (MIT) - github.com/bridge-mind/tideline
import * as THREE from 'three';

// ---------- Renderer (Android perf: cap pixel ratio) ----------
const wrap = document.getElementById('canvas-wrap');
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
wrap.appendChild(renderer.domElement);

// ---------- Scene + camera ----------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9fd8ff);
scene.fog = new THREE.Fog(0x9fd8ff, 14, 34);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 3.4, 7);
camera.lookAt(0, 0.9, 0);

// ---------- Lights ----------
const hemi = new THREE.HemisphereLight(0xffffff, 0x9ac27a, 0.9);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff4e0, 1.6);
sun.position.set(5, 9, 6);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
scene.add(sun);

// ---------- Ground ----------
const ground = new THREE.Mesh(
  new THREE.CylinderGeometry(9, 9, 0.4, 48),
  new THREE.MeshStandardMaterial({ color: 0x7ec850, roughness: 1 })
);
ground.position.y = -0.2;
ground.receiveShadow = true;
scene.add(ground);

// ---------- Placeholder pet (procedural, no assets) ----------
function makePet() {
  const g = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({ color: 0xffb84d, roughness: 0.6 });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.8, 24, 18), skin);
  body.scale.set(1, 0.92, 1);
  body.castShadow = true;
  g.add(body);
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.3 });
  const eyeGeo = new THREE.SphereGeometry(0.09, 12, 10);
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  eyeL.position.set(-0.26, 0.18, 0.72);
  const eyeR = eyeL.clone();
  eyeR.position.x = 0.26;
  g.add(eyeL, eyeR);
  const earGeo = new THREE.ConeGeometry(0.18, 0.42, 12);
  const earL = new THREE.Mesh(earGeo, skin);
  earL.position.set(-0.55, 0.62, 0);
  earL.rotation.z = 0.5;
  const earR = new THREE.Mesh(earGeo, skin);
  earR.position.set(0.55, 0.62, 0);
  earR.rotation.z = -0.5;
  g.add(earL, earR);
  return g;
}
const pet = makePet();
pet.position.y = 0.85;
scene.add(pet);

// ---------- State ----------
const hudCoins = document.getElementById('hud-coins');
let coins = 0;

// ---------- Tap interaction (pointer events = touch + mouse) ----------
const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();
let hopT = -1; // seconds since hop start, -1 = idle

window.addEventListener('pointerdown', (e) => {
  ndc.x = (e.clientX / window.innerWidth) * 2 - 1;
  ndc.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(ndc, camera);
  const hit = raycaster.intersectObject(pet, true).length > 0;
  if (hit && hopT < 0) {
    hopT = 0;
    coins += 1;
    hudCoins.textContent = 'Coins: ' + coins;
  }
});

// ---------- Loop ----------
const clock = new THREE.Clock();
let idle = 0;
const HOP_DUR = 0.38;

function tick() {
  requestAnimationFrame(tick);
  const dt = Math.min(clock.getDelta(), 0.05);
  idle += dt;
  const look = Math.sin(idle * 0.7) * 0.25; // gentle look-around
  let y = 0.85 + Math.sin(idle * 2.2) * 0.05; // idle bob
  let spin = 0;
  if (hopT >= 0) {
    hopT += dt;
    const p = Math.min(hopT / HOP_DUR, 1);
    y += Math.sin(p * Math.PI) * 0.9; // hop arc
    spin = p * Math.PI; // half spin over the hop
    if (p >= 1) hopT = -1;
  }
  pet.position.y = y;
  pet.rotation.y = look + spin;
  renderer.render(scene, camera);
}
tick();

// ---------- Resize ----------
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
