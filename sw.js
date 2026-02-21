const CACHE_NAME = 'vila-kosove-v4'; // Versioni v4 detyron rifreskimin e ikonës së re
const assets = [
  '/',
  '/index.html',
  '/eksploro.html',
  '/rreth-nesh.html',
  '/detajet.html',
  '/listing.css',
  '/listing.js',
  '/favicona.png', // Emri i saktë i ikonës tënde
  '/manifest.json'
];

// Instalimi i Service Worker
self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Duke ruajtur resurset e reja në cache (v4)...');
      return cache.addAll(assets).catch(err => {
        console.error('Gabim gjatë caching: Sigurohu që favicona.png dhe skedarët e tjerë janë në folderin kryesor.', err);
      });
    })
  );
});

// Aktivizimi - Pastron cache-in e vjetër (v1, v2, v3)
self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      );
    })
  );
  console.log('Service Worker i ri (v4) u aktivizua.');
});

// Marrja e të dhënave (Fetch Strategy: Cache First, then Network)
self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request).then(cacheRes => {
      // Kthen resursin nga cache nëse ekziston, përndryshe e kërkon në rrjet
      return cacheRes || fetch(evt.request).catch(err => {
        if (evt.request.mode === 'navigate') {
          console.warn('Jeni offline. Disa faqe mund të mos ngarkohen.');
        }
      });
    })
  );
});
