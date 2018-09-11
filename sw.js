var CACHE_NAME = 'my-site-cache-v1';
var urlsToCache = [
    '/',
    'css/dark-theme-v001.css',
    'css/light-theme-v001.css',
    'css/main-v002.css',
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
        caches.match(event.request).then(function(response) {
            if (response) {
                return response;
            }
            return fetch(event.request);
        })
    );
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    return caches.delete(cacheName);
                })
            );
        })
    );
}); 