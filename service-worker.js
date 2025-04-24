// Name for the cache storage to identify this version of cached assets
const CACHE_NAME = 'static-assets-cache-v1';

// List of static assets to cache during the install event
const CACHE_ASSETS = [
  '/', // root of the website
  '/index.html',
  '/styles.css',
  '/script.js',
  // All the images used on the site
  '/Images/2080.jpg',
  '/Images/beats.jpg',
  '/Images/controller-white.jpg',
  '/Images/headphones.jpg',
  '/Images/iMac.jpg',
  '/Images/logo.jpg',
  '/Images/macbook.jpg',
  '/Images/mouse 2.jpg',
  '/Images/ps5-bag.jpg',
  '/Images/switch.jpg',
  '/Images/xbox-controller.jpg'
];

// 'install' event runs when the Service Worker is being installed
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  // Wait until all assets are cached before finishing the install
  event.waitUntil(
    caches.open(CACHE_NAME) // Open or create the cache storage
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(CACHE_ASSETS) // Add all listed files to the cache
          .catch((error) => {
            console.error('Error caching assets:', error); // Log if any file fails to cache
          });
      })
  );
});

// 'activate' event runs when the Service Worker takes control of the page
self.addEventListener('activate', () => {
  console.log('Service Worker activated');
});

// 'fetch' event intercepts network requests made by the page
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request) // Check if the request is already cached
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse; // If cached, return it
        }
        return fetch(event.request); // Otherwise, fetch it from the network
      })
  );
});

