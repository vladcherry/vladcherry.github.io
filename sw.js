/* Vlad's Apps — service worker for the store shell only.
 *
 * This worker sits at the root of vladcherry.github.io, so every app under
 * /bus-radar/, /barogram/ and friends is inside its scope. Each app registers
 * its own worker with a narrower scope, which wins — but on a first visit,
 * before that registration exists, this worker would be asked about those
 * requests too. So it answers ONLY for the exact URLs it precached and stays
 * out of the way of everything else.
 */

const VERSION = 'store-v2';

const SHELL = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/apps.json',
  '/manifest.webmanifest',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png',
  '/icons/apple-touch-icon.png',
  '/icons/apps/bus-radar.png',
  '/icons/apps/beer-ispindel.png',
  '/icons/apps/mdzy.png',
  '/icons/apps/barogram.png',
  '/icons/apps/fit-balance.png',
  '/icons/apps/cesta.png',
  '/icons/apps/smart-dog.png',
  '/icons/apps/espanol-a1-juego.png',
  '/icons/apps/imotbg.svg',
  '/icons/apps/repasa.svg',
];

const OWNED = new Set(SHELL);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const path = url.pathname;
  const isShellDoc = req.mode === 'navigate' && (path === '/' || path === '/index.html');

  // Anything that is not part of this store — including every sub-app — is left
  // entirely to the network and to that app's own service worker.
  if (!isShellDoc && !OWNED.has(path)) return;

  if (isShellDoc) {
    // Fresh page when online, cached shell when not.
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put('/', copy));
          return res;
        })
        .catch(() => caches.match('/').then((hit) => hit || caches.match('/index.html')))
    );
    return;
  }

  // Assets: serve from cache, refresh in the background.
  event.respondWith(
    caches.match(req).then((hit) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => hit);
      return hit || network;
    })
  );
});
