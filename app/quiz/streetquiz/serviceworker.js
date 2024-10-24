/*
  HTML: network, then offline page
  CSS: cache, then network
  JS: cache, then network
  Tile images: network
*/

const cacheName = "files";
const offlinePage = "/app/quiz/streetquiz/offline";

addEventListener("install", (installEvent) => {
  skipWaiting();
  installEvent.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache.addAll([
        offlinePage, // The only HTML page cached
        "/app/quiz/streetquiz/images/android-chrome-512x512.png",
        "/app/quiz/streetquiz/images/apple-touch-icon.png",
        "/app/quiz/streetquiz/images/leaflet/marker-icon.png",
        "/app/quiz/streetquiz/images/leaflet/marker-icon-2x.png",
        "/app/quiz/streetquiz/images/leaflet/marker-shadow.png",
        "/app/quiz/streetquiz/build/bundle.css",
        "/app/quiz/streetquiz/build/bundle.js",
        //"/app/quiz/streetquiz/gc.js",
        "/favicon.png",
        "/app/quiz/streetquiz/manifest.webmanifest",
      ]);
    })
  );
});

addEventListener("activate", (activateEvent) => {
  clients.claim();

  // Prune old caches
  activateEvent.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== cacheName)
            .map((key) => caches.delete(key))
        )
      )
  );
});

addEventListener("fetch", (fetchEvent) => {
  // https://stackoverflow.com/a/49719964/727074
  if (
    fetchEvent.request.cache === "only-if-cached" &&
    fetchEvent.request.mode !== "same-origin"
  ) {
    return;
  }

  const request = fetchEvent.request;
  if (
    request.method !== "GET" //||
    //request.url.includes("count.backofyourhand.com") ||
    //request.url.includes("/tiles")
  ) {
    return;
  }
  fetchEvent.respondWith(
    (async function () {
      const responseFromFetch = fetch(request);
      if (request.headers.get("Accept").includes("text/html")) {
        try {
          const response = await responseFromFetch;
          return response;
        } catch (error) {
          return (await caches.open(cacheName)).match(offlinePage);
        }
      } else {
        fetchEvent.waitUntil(
          (async function () {
            const responseCopy = (await responseFromFetch).clone();
            const myCache = await caches.open(cacheName);
            await myCache.put(request, responseCopy);
          })()
        );
        return (
          (await (await caches.open(cacheName)).match(request)) ||
          responseFromFetch
        );
      }
    })()
  );
});
