const cacheName = "prospettiva";

const appShellFiles = [
  "/js/controls.js",
  "/js/prospettiva.js",
  "/css/prospettiva.css",
  "/css/gfx.css",
  "/controls.html",
  "/index.html",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    (async () => {
      const cache = await caches.open(cacheName);
      for (const file of appShellFiles) {
        await cache.delete(file);
        await cache.add(file).catch(_=>console.error(`can't load ${file} to cache`));
      }
    })(),
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    (async () => {
      const r = await caches.match(e.request);
      console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
      if (r) {
        return r;
      }
      const response = await fetch(e.request);
      const cache = await caches.open(cacheName);
      console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
      cache.put(e.request, response.clone());
      return response;
    })(),
  );
});