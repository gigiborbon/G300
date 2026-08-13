// ============================================================================
// SERVICE WORKER — caches the app shell so it loads instantly and has an
// offline fallback. Never caches API calls to Apps Script: money data must
// always be fresh.
// ============================================================================

var CACHE_NAME = 'g-shell-v6';
var SHELL_FILES = [
  './',
  './index.html',
  './offline.html',
  './manifest.json',
  './css/styles.css',
  './css/form.css',
  './css/dashboard.css',
  './js/config.js',
  './js/api.js',
  './js/auth.js',
  './js/form.js',
  './js/dashboard.js',
  './js/app.js',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/gigi-logo.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) { return cache.addAll(SHELL_FILES); })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE_NAME; }).map(function (k) { return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  var url = event.request.url;

  // Never cache calls to the Apps Script API or Google auth — always network.
  if (url.indexOf('script.google.com') !== -1 || url.indexOf('accounts.google.com') !== -1 || url.indexOf('googleapis.com') !== -1) {
    event.respondWith(
      fetch(event.request).catch(function () {
        return new Response(JSON.stringify({ ok: false, error: 'Offline — try again once connected.' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // App shell: cache-first, fall back to network, fall back to offline page.
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      return cached || fetch(event.request).catch(function () {
        if (event.request.mode === 'navigate') {
          return caches.match('./offline.html');
        }
      });
    })
  );
});
