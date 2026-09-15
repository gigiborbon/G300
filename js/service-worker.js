var CACHE_NAME = 'g-shell-v001';
var SHELL_FILES = [
  './',
  './index.html',
  './offline.html',
  './manifest.json',
  './css/styles.css',
  './css/form.css',
  './css/dashboard.css',
  './css/cash-count.css',
  './js/config.js',
  './js/api.js',
  './js/auth.js',
  './js/form.js',
  './js/dashboard.js',
  './js/cash-count.js',
  './js/app.js',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/gigi-logo.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(caches.open(CACHE_NAME).then(function (cache) { return cache.addAll(SHELL_FILES); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (key) { return key !== CACHE_NAME; }).map(function (key) {
      return caches.delete(key);
    }));
  }));
  self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  var url = event.request.url;
  if (url.indexOf('script.google.com') !== -1 || url.indexOf('accounts.google.com') !== -1 || url.indexOf('googleapis.com') !== -1) {
    event.respondWith(fetch(event.request));
    return;
  }
  event.respondWith(caches.match(event.request).then(function (cached) {
    return cached || fetch(event.request).catch(function () {
      if (event.request.mode === 'navigate') return caches.match('./offline.html');
    });
  }));
});
