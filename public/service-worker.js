
const FILES_TO_CACHE = [
    "/", 
    "/index.html", 
    "/index.js", 
    "/styles.css", 
    "/icons/icon-192x192.png", 
    "/icons/icon-512x512.png",
    "/manifest.webmanifest",
    "/db.js"
  ];
  
  const CACHE_NAME = "static-cache-v2";
  const DATA_CACHE_NAME = "data-cache-v1";

  self.addEventListener("install", function (evt) {
    evt.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        console.log("Your files were pre-cached successfully!");
        return cache.addAll(FILES_TO_CACHE);
      })
    );
  
    self.skipWaiting();
  });
  
  self.addEventListener("activate", function (evt) {
    evt.waitUntil(
      caches.keys().then(keyList => {
        return Promise.all(
          keyList.map(key => {
            if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
              console.log("Removing old cache data", key);
              return caches.delete(key);
            }
          })
        );
      })
    );
  
    self.clients.claim();
  });
  
  self.addEventListener("fetch", function(evt) {
    const {url} = evt.request;
    if (url.includes("/all") || url.includes("/find")) {
      evt.respondWith(
        caches.open(DATA_CACHE_NAME).then(cache => {
          return fetch(evt.request)
            .then(response => {
              // If the response was good, clone it and store it in the cache.
              if (response.status === 200) {
                cache.put(evt.request, response.clone());
              }
  
              return response;
            })
            .catch(err => {
              // Network request failed, try to get it from the cache.
              return cache.match(evt.request);
            });
        }).catch(err => console.log(err))
      );
    } else {
      // respond from static cache
      evt.respondWith(
        caches.open(CACHE_NAME).then(cache => {
          return cache.match(evt.request).then(response => {
            return response || fetch(evt.request);
          });
        })
      );
    }
   });

  