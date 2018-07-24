self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('mws-restaurant-stage-1').then(cache => {
      return cache.addAll([
        '/',
        '/css/styles.css',
        '/js/dbhelper.js',
        '/js/main.js',
        '/data/restaurants.json',
      ]);
    })
  )
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});
