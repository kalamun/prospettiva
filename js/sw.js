const cacheName = "prospettiva";

const appShellFiles = [
  "js/controls.js",
  "js/prospettiva.js",
  "css/prospettiva.css",
  "css/gfx.css",
  "controls.html",
  "index.html",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    (async () => {
      const cache = await caches.open(cacheName);
      for (const file of appShellFiles) {
        await cache.delete(file);
      }
      await cache.addAll(appShellFiles);
    })(),
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    (async () => {
      const r = await caches.match(e.request);
      if (r) {
        return r;
      }
      const response = await fetch(e.request);
      const cache = await caches.open(cacheName);
      cache.put(e.request, response.clone());
      return response;
    })(),
  );
});