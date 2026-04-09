const CACHE_NAME = 'body-age-v2';
const BASE = '/body-age/';

const ASSETS = [
    BASE,
    BASE + 'index.html',
    BASE + 'manifest.json',
    BASE + 'css/style.css',
    BASE + 'js/app.js',
    BASE + 'js/attention.js',
    BASE + 'js/balance.js',
    BASE + 'js/calculator.js',
    BASE + 'js/hearing.js',
    BASE + 'js/history.js',
    BASE + 'js/memory.js',
    BASE + 'js/neural.js',
    BASE + 'js/tips.js',
    BASE + 'js/vision.js',
    BASE + 'icon-192.png',
    BASE + 'icon-maskable-512.png',
    BASE + 'icon.png',
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;
            return fetch(event.request).catch(() => caches.match(BASE + 'index.html'));
        })
    );
});
