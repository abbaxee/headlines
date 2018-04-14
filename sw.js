var staticCacheName = 'headline-static-v8';
self.addEventListener('install', function (event) { 
    event.waitUntil(

        caches.open(staticCacheName).then(function(cache) {
            return cache.addAll([
                'https://abbaxee.github.io/headlines/',
                'https://abbaxee.github.io/headlines/index.html',
                'https://code.jquery.com/jquery-3.2.1.slim.min.js',
                'https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js',
                'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js',
                'https://abbaxee.github.io/headlines/js/idb.js',
                'https://abbaxee.github.io/headlines/main.js',
                'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css',
                'https://abbaxee.github.io/headlines/css/style.css'
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
