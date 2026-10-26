// PetVerse service worker: offline app shell with network-first updates.
// Bump CACHE_VERSION on every deploy that changes any cached asset.
// Register from src/main.js with './sw.js' (relative, works on the Pages subpath).

const CACHE_VERSION = 'petverse-v4';
const CORE = [
  './',
  './index.html',
  './styles.css',
  './manifest.webmanifest',
  './icon.svg',
  './src/main.js',
  './src/data/config.js',
  './src/core/bus.js',
  './src/core/audio.js',
  './src/state/fsm.js',
  './src/state/save.js',
  './src/state/migrations.js',
  './src/gameplay/petStats.js',
  './src/gameplay/progression.js',
  './src/gameplay/eggs.js',
  './src/render/scene.js',
  './src/render/island.js',
  './src/render/pet.js',
  './src/render/egg.js',
  './src/ui/ftue.js',
  './src/ui/feedback.js',
  './src/ui/eggShop.js',
  './src/ui/collection.js',
  'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_VERSION)
      .then(function (c) { return c.addAll(CORE); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.map(function (k) {
          if (k !== CACHE_VERSION) return caches.delete(k);
        }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    fetch(req).then(function (res) {
      if (res && res.status === 200) {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then(function (c) { c.put(req, copy); });
      }
      return res;
    }).catch(function () {
      return caches.match(req, { ignoreSearch: true }).then(function (m) {
        return m || caches.match('./index.html');
      });
    })
  );
});
