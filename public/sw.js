const CACHE = 'wohnungsplaner-shell-v1';
self.addEventListener('install', (event) => event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(['/', '/manifest.webmanifest', '/icon.svg']))));
self.addEventListener('fetch', (event) => { if (event.request.method === 'GET') event.respondWith(fetch(event.request).catch(() => caches.match(event.request).then((r) => r || caches.match('/')))); });
