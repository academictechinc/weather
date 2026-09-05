const CACHE_NAME = 'weather-app-v3';
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

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
