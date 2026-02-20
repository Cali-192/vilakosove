const CACHE_NAME = 'vila-kosove-v2'; // Ndryshuam versionin për të rifreskuar cache-in
const assets = [
  '/',
  '/index.html',
  '/eksploro.html',
  '/rreth-nesh.html',
  '/detajet.html',
  '/listing.css',
  '/listing.js',
  '/ikona-192.png',
  '/ikona-512.png',
  '/favicon.ico'
];

// Instalimi i Service Worker
self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Duke ruajtur resurset në cache...');
      // Përdorim addAll me kujdes, nëse një file mungon, catch do ta parandalojë dështimin
      return cache.addAll(assets).catch(err => console.error('Gabim gjatë caching:', err));
    })
  );
});

// Aktivizimi - Pastron cache-in e vjetër nëse ekziston
self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      );
    })
  );
  console.log('Service Worker i ri u aktivizua.');
});

// Marrja e të dhënave (Fetch)
self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request).then(cacheRes => {
      // Kthen resursin nga cache, ose bën kërkesën në rrjet
      return cacheRes || fetch(evt.request).catch(err => {
        // Këtu kapet gabimi "Failed to fetch" (psh. kur wttr.in dështon)
        console.warn('Rrjeti dështoi për:', evt.request.url);
      });
    })
  );
});