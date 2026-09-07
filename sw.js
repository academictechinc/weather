const CACHE_NAME = 'weather-app-v8';
const SHELL_ASSETS = ['./', './index.html', './manifest.json', './icon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  // Live data must always be fresh — never intercept weather/radar/map traffic.
  const isLiveData =
    url.includes('open-meteo.com') ||
    url.includes('rainviewer.com') ||
    url.includes('openstreetmap.org') ||
    url.includes('bigdatacloud.net');

  if (isLiveData) return;

  // Network-first for the app shell itself: always serve the latest deployed
  // version when online, and only fall back to the cached copy if offline.
  // This is what makes future updates show up without any manual cache-busting.
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
