const CACHE_NAME = "ari-tenten-math-v16-pwa-1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./app.js",
  "./manifest.webmanifest",
  "./assets/icons/app-icon-180.png",
  "./assets/icons/app-icon-192.png",
  "./assets/icons/app-icon-512.png",
  "./assets/characters/ari-cloud-explorer.png",
  "./assets/characters/ari-dragon-hero.png",
  "./assets/characters/ari-idle.png",
  "./assets/characters/ari-moon-bunny.png",
  "./assets/characters/ari-strawberry-chef.png",
  "./assets/characters/ari-success.png",
  "./assets/characters/ari-tenten-highfive.png",
  "./assets/characters/ari-thinking.png",
  "./assets/characters/tenten-cloud-pajama.png",
  "./assets/characters/tenten-cupcake-chef.png",
  "./assets/characters/tenten-dino-explorer.png",
  "./assets/characters/tenten-hint.png",
  "./assets/characters/tenten-idle.png",
  "./assets/characters/tenten-rainbow-guide.png",
  "./assets/characters/tenten-success.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put("./index.html", copy));
          return response;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const refreshed = fetch(request)
        .then((response) => {
          if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
          return response;
        })
        .catch(() => cached);
      return cached || refreshed;
    })
  );
});
