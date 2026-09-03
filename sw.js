// v2: network-first for the HTML shell, so updates show up immediately instead of
// being stuck behind a stale cached copy. Only truly static assets (icons, manifest)
// are cache-first, since those rarely change and are safe to serve instantly.
const CACHE = 'mtg-ledger-shell-v2';
const STATIC_ASSETS = ['./manifest.json', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // Scryfall API, card images, fonts: always network

  const isHTML = e.request.mode === 'navigate' || url.pathname.endsWith('/index.html') || url.pathname.endsWith('/');

  if (isHTML) {
    // Network-first: always try to get the latest app first. Only fall back to
    // whatever was last cached if the device is offline.
    e.respondWith(
      fetch(e.request)
        .then((resp) => {
          const copy = resp.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
          return resp;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Static assets: cache-first, refreshed in the background for next time.
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const fetchPromise = fetch(e.request)
        .then((resp) => {
          const copy = resp.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
          return resp;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
