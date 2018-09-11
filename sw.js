var CACHE_NAME = 'my-site-cache-v6';
var urlsToCache = [
    '.',
    'css/dark-theme-v001.css',
    'css/light-theme-v001.css',
    'css/main-v002.css',
    'css/normalize.css',
    'js/main.js',
    'js/pako.min.js',
    'js/readSave.js',
    'root2',
    'root2/css/dark-theme-v001.css',
    'root2/css/light-theme-v001.css',
    'root2/css/main-v002.css',
    'root2/css/normalize.css',
    'root2/js/main.js',
    'root2/js/pako.min.js',
    'root2/js/readSave.js',
    'root2/swf'
    
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
                    if (cacheName !== CACHE_NAME)
                        return caches.delete(cacheName);
                })
            );
        })
    );
}); 