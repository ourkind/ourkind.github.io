const CACHE = "raeford-outreach-v2-8";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./drafts.js",
  "./tutor.js",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./manual.pdf",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) => key.startsWith("raeford-outreach-") && key !== CACHE,
            )
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

async function respond(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request.url);
  const range = request.headers.get("range");
  if (cached && range) {
    const data = await cached.arrayBuffer();
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match) return new Response(null, { status: 416 });
    const start = match[1]
      ? Number(match[1])
      : Math.max(0, data.byteLength - Number(match[2]));
    const end =
      match[1] && match[2]
        ? Math.min(Number(match[2]), data.byteLength - 1)
        : data.byteLength - 1;
    if (start > end || start >= data.byteLength) {
      return new Response(null, {
        status: 416,
        headers: { "Content-Range": "bytes */" + data.byteLength },
      });
    }
    return new Response(data.slice(start, end + 1), {
      status: 206,
      headers: {
        "Content-Type":
          cached.headers.get("Content-Type") || "application/octet-stream",
        "Content-Range": "bytes " + start + "-" + end + "/" + data.byteLength,
        "Content-Length": String(end - start + 1),
        "Accept-Ranges": "bytes",
      },
    });
  }
  if (cached) return cached;
  const response = await fetch(request);
  if (response.status === 200) await cache.put(request, response.clone());
  return response;
}

self.addEventListener("fetch", (event) => {
  if (
    event.request.method === "GET" &&
    new URL(event.request.url).origin === self.location.origin
  ) {
    event.respondWith(respond(event.request));
  }
});
