// KILL SWITCH - Unregisters this service worker immediately.
// Seblak Listyaning no longer uses a service worker because it caused
// cross-origin login/cookie issues between Vercel (frontend) and
// Railway (backend API).

const CACHE_NAME = 'seblak-delivery-obliterate';

self.addEventListener('install', () => {
  // Skip waiting so new users never get the old broken one
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // 1. Delete all caches owned by this SW
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((name) => caches.delete(name))
      );

      // 2. Unregister this SW permanently
      await self.registration.unregister();

      // 3. Claim all clients then force them to reload cleanly
      const clientsArr = await self.clients.matchAll({ type: 'window' });
      for (const client of clientsArr) {
        if (client && 'navigate' in client && client.url) {
          try {
            client.navigate(client.url);
          } catch {
            // Some browsers don't allow navigate in activate; ignore
          }
        }
      }
    })()
  );
});

// Never intercept any fetch requests - pass through and fail fast
self.addEventListener('fetch', () => {
  // Intentionally empty: don't call respondWith so browser uses network directly.
});
