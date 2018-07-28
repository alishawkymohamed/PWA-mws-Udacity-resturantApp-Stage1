if (typeof idb === "undefined") {
  self.importScripts('./js/idb/idb.js');
}
const staticCacheName = 'restaurant-cache-v1';
const cacheUrls = [
  '/',
  '/index.html',
  '/restaurant.html',
  '/css/styles.css',
  '/js/dbhelper.js',
  '/js/main.js',
  '/js/restaurant_info.js',
  '/img/static/offline_img1.png',
  'https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.0/normalize.min.css'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(staticCacheName)
      .then(cache => {
        return cache.addAll(cacheUrls).catch(error => {
          console.log('Caches open failed: ' + error);
        });
      })
  );
});

self.addEventListener('fetch', event => {
  // Going to request data from server
  if (event.request.url.startsWith('http://localhost:1337')) {
    event.respondWith(
      fetch(event.request).then(fetchResponse => {
        return fetchResponse;
      })
    )
  }
  else {
    event.respondWith(
      // Add cache.put to cache images on each fetch
      caches.match(event.request).then(response => {
        return response || fetch(event.request).then(fetchResponse => {
          return caches.open(staticCacheName).then(cache => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      }).catch(error => {
        if (event.request.url.includes('.jpg')) {
          return caches.match('/img/static/offline_img1.png');
        }
        return new Response('Not connected to the internet', {
          status: 404,
          statusText: "Not connected to the internet"
        });
      })
    );
  }
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName.startsWith('restaurant-cache-') && cacheName !== staticCacheName;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    })
  );
});