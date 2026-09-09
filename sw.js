// Service Worker - Keuangan Keluarga PWA
const CACHE_NAME = 'keuangan-keluarga-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Install: cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate: hapus cache lama
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: Network first, fallback ke cache
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Jangan intercept Firebase / CDN requests
  if (
    url.hostname.includes('firebasedatabase.app') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('gstatic.com') ||
    url.hostname.includes('cloudflare.com') ||
    url.hostname.includes('fcm.googleapis.com')
  ) {
    return;
  }

  // Untuk asset lokal: Network first, fallback cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Simpan ke cache kalau response ok
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
