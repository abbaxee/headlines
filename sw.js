var staticCacheName = 'headline-static-v7';

self.addEventListener('install', function (event) { 
    event.waitUntil(
        caches.open(staticCacheName).then(function(cache) {
            return cache.addAll([
                '/',
                'https://code.jquery.com/jquery-3.2.1.slim.min.js',
                'https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js',
                'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js',
                'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.22.1/moment.js',
                'js/idb.js',
                'main.js',
                'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css',
                'css/style.css',
                "img/breaking-news.jpg"
            ]);
        })
    );
});

self.addEventListener('activate', function(event) { 
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.filter(function(cacheName){
                return cacheName.startsWith('headline-') && cacheName != staticCacheName;
                }).map(function(cacheName){
                    return caches.delete(cacheName);
                })
            );
        })
    );
});

// Respond with an existing cache or 
//fetch a new one if it doesn't exist
self.addEventListener('fetch', function(event) { 
    event.respondWith(
        caches.match(event.request).then(function (response) {
            return response || fetch(event.request);
        })
    );
});
