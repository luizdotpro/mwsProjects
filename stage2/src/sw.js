self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('stage2').then(cache => {
      return cache.addAll([
        '/',
        'index.html',
        'restaurant.html',
        '/css/styles.min.css',
        '/js/dbhelper.js',
        '/js/main.js',
        '/js/restaurant_info.js',
        '/img/1_w_500.jpg',
        '/img/2_w_500.jpg',
        '/img/3_w_500.jpg',
        '/img/4_w_500.jpg',
        '/img/5_w_500.jpg',
        '/img/6_w_500.jpg',
        '/img/7_w_500.jpg',
        '/img/8_w_500.jpg',
        '/img/9_w_500.jpg',
        '/img/10_w_500.jpg',
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
