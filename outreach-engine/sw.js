const CACHE = "raeford-oe-1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./cormorant-garamond-latin.woff2",
  "./manrope-latin.woff2",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()),
  );
});

/* clear this app's own old caches, never another project's on the same site */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("raeford-oe-") && key !== CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

/* network first so updates show up, saved copy when offline */
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin) return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok && !response.redirected) {
          const copy = response.clone();
          event.waitUntil(caches.open(CACHE).then((c) => c.put(event.request, copy)).catch(() => {}));
        }
        return response;
      })
      .catch(() =>
        caches.match(event.request, { ignoreSearch: true }).then(
          (hit) =>
            hit ||
            (event.request.mode === "navigate" ? caches.match("./") : Response.error()),
        ),
      ),
  );
});
