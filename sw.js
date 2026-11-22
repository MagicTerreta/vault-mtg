// v2: network-first for the HTML shell, so updates show up immediately instead of
// being stuck behind a stale cached copy. Only truly static assets (icons, manifest)
// are cache-first, since those rarely change and are safe to serve instantly.
// v3: MagicTerreta rename — new name clears the old cached icons/manifest on activate.
// v4: Terreta TCG rename.
// v5: fonts and set/mana symbols come from ./vendor/ (no Google Fonts, no CDN) and work offline.
// v6: on a slow or flaky connection the app no longer waits for the network: after 2.5 s it opens the
//     saved copy (and keeps downloading the new one for next time).
const CACHE = 'terreta-shell-v6';
const STATIC_ASSETS = ['./manifest.json', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png',
  './vendor/LICENSES.txt',
  './vendor/fonts.css',
  './vendor/fraunces-latin-ext.woff2',
  './vendor/fraunces-latin.woff2',
  './vendor/ibm-plex-mono-400-latin-ext.woff2',
  './vendor/ibm-plex-mono-400-latin.woff2',
  './vendor/ibm-plex-mono-500-latin-ext.woff2',
  './vendor/ibm-plex-mono-500-latin.woff2',
  './vendor/ibm-plex-mono-600-latin-ext.woff2',
  './vendor/ibm-plex-mono-600-latin.woff2',
  './vendor/keyrune.min.css',
  './vendor/keyrune.woff2',
  './vendor/mana.min.css',
  './vendor/mana.woff2',
  './vendor/public-sans-latin-ext.woff2',
  './vendor/public-sans-latin.woff2'];

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
  if (url.origin !== location.origin) return; // Scryfall API and card images: always network

  const isHTML = e.request.mode === 'navigate' || url.pathname.endsWith('/index.html') || url.pathname.endsWith('/');

  if (isHTML) {
    // Network-first, but never stuck: the latest app when the connection answers in time; otherwise the
    // copy saved last time (offline, or no answer within 2.5 s). The download carries on and is saved.
    const net = fetch(e.request).then((resp) => {
      if (resp && resp.ok) { const copy = resp.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
      return resp;
    });
    e.waitUntil(net.catch(() => {}));
    e.respondWith(caches.match(e.request).then((cached) => {
      if (!cached) return net;
      const late = new Promise((res) => setTimeout(() => res(cached), 2500));
      return Promise.race([net.catch(() => cached), late]);
    }));
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
