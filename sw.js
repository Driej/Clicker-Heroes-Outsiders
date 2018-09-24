var CACHE_NAME = 'outsiders-cache-v13';
var urlsToCache = [
    '.',
    'css/dark-theme-v003.css',
    'css/light-theme-v003.css',
    'css/main-v004.css',
    'css/normalize.css',
    'js/main.js',
    'js/pako.min.js',
    'js/readSave.js'
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.has(CACHE_NAME)
        .then(function(exists) {
            if (exists) return exists
            else throw 'Cache does not exist';
        })
        .catch(function(error) {
            return caches.open(CACHE_NAME).then(function(cache) {
                return cache.addAll(urlsToCache);
            });
        })
        .then(function(cache) {
            return caches.match(event.request);
        })
        .then(function(response) {
            if (response) return response
            else return fetch(event.request);
        })
    );
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName.slice(0,15) == "outsiders-cache") {
                        if (cacheName !== CACHE_NAME) return caches.delete(cacheName);
                    }
                })
            );
        })
    );
}); 