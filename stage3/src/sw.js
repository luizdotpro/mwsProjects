const cacheTitle = 'stage2';

self.addEventListener('install', function(event) {
  event.waitUntil(
      caches
      .open(cacheTitle)
      .then(function(cache) {
        return cache.addAll([
        '/',
        'index.html',
        'restaurant.html',
        '/css/styles.min.css',
        '/js/dbhelper.js',
        '/js/main.js',
        '/js/restaurant_info.js',
        '/img/1_w_500.webp',
        '/img/2_w_500.webp',
        '/img/3_w_500.webp',
        '/img/4_w_500.webp',
        '/img/5_w_500.webp',
        '/img/6_w_500.webp',
        '/img/7_w_500.webp',
        '/img/8_w_500.webp',
        '/img/9_w_500.webp',
        '/img/10_w_500.webp',
      ])
      })
  );
});

self.addEventListener('activate', function(event) {

  event.waitUntil(
    caches.keys()
      .then(function (keyList) {
        return Promise.all(keyList.map((key) => {
          if (key !== cacheTitle) {
            console.log('Remove old cache', key);
            return caches.delete(key);
          }
        }))
      })
  )
});

function returnFromCache(event) {
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }) 
      .then(function(response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
}

self.addEventListener('fetch', function(event) {
  returnFromCache(event);
});
