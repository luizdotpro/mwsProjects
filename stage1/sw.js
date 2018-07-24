self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('stage1').then(cache => {
      return cache.addAll([
        '/',
        'index.html',
        'restaurant.html',
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
