var CACHE_STATIC_NAME = "static-v3";
var CACHE_DYNAMIC_NAME = "dynamic-v2";
var STATIC_FILE = [
  "/",
  "/index.html",
  "/offline.html",
  "/src/js/app.js",
  "/src/js/feed.js",
  "/src/js/promise.js",
  "/src/js/fetch.js",
  "/src/js/material.min.js",
  "/src/css/app.css",
  "/src/css/feed.css",
  "/src/images/main-image.jpg",
  "https://fonts.googleapis.com/css?family=Roboto:400,700",
  "https://fonts.googleapis.com/icon?family=Material+Icons",
  "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css",
];
// self.addEventListener("install", function (event) {
//   console.log("[Service Worker] installing service Worker....", event);
// });

function trimCache(cacheName, maxItems) {
  caches.open(cacheName).then(function (cache) {
    return cache.keys().then(function (keys) {
      if (keys.length > maxItems) {
        cache.delete(keys[0]).then(trimCache(cacheName, maxItems));
      }
    });
  });
}

self.addEventListener("install", function (event) {
  console.log("[Service Worker] installing service Worker....", event);
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME).then(function (cache) {
      console.log("[service worker] preCaching App Shell");
      // cache.add("/");
      // cache.add("/index.html");
      // cache.add("/src/js/app.js");
      cache.addAll(STATIC_FILE);
    })
  );
});

self.addEventListener("activate", function (event) {
  console.log("[Service Worker] activate service Worker....", event);
  // removing pre caches
  event.waitUntil(
    caches
      .keys()
      .then(function (KeyList) {
        // console.log("KeyList---->", KeyList);// here array of key of caches
        return Promise.all(
          KeyList.map(function (key) {
            // console.log("Key---->", key);
            if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
              console.log("[Service worker removing old caches]", key);
              return caches.delete(key);
            }
          })
        );
      })
      .catch(function (err) {})
  );
  return self.clients.claim();
});

// *******************************Fetching***************************************

// self.addEventListener("fetch", function (event) {
//   console.log("[Service Worker] fetching something....", event);
//   event.respondWith(fetch(event.request));
// });

// self.addEventListener("fetch", function (event) {
//   console.log("[Service Worker] fetching something....", event);
//   event.respondWith(
//     caches.match(event.request).then(function (response) {
//       if (response) {
//         return response;
//       } else {
//         return fetch(event.request)
//           .then(function (res) {
//             return caches.open(CACHE_DYNAMIC_NAME).then(function (cache) {
//               cache.put(event.request.url, res.clone());
//               return res;
//             });
//           })
//           .catch(function (err) {
//             return caches.open(CACHE_STATIC_NAME).then(function (cache) {
//               return cache.match("/offline.html");
//             });
//           });
//       }
//     })
//   );
// });

function isInArray(string, array) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] === string) {
      return true;
    }
    return false;
  }
}

self.addEventListener("fetch", function (event) {
  var url = "https://httpbin.org/get";
  if (event.request.url.indexOf(url) > -1) {
    event.respondWith(
      caches.open(CACHE_DYNAMIC_NAME).then(function (cache) {
        return fetch(event.request).then(function (res) {
          trimCache(CACHE_DYNAMIC_NAME, 3);
          cache.put(event.request, res.clone());
          return res;
        });
      })
    );
  }
  //  new RegExp("\\b" + STATIC_FILE.join("\\b|\\b") + "\\b").test(
  // event.request.url)
  else if (isInArray(event.request.url, STATIC_FILE)) {
    event.respondWith(caches.match(event.request));
  } else {
    event.respondWith(
      caches.match(event.request).then(function (response) {
        if (response) {
          return response;
        } else {
          return fetch(event.request)
            .then(function (res) {
              return caches.open(CACHE_DYNAMIC_NAME).then(function (cache) {
                trimCache(CACHE_DYNAMIC_NAME, 3);
                cache.put(event.request.url, res.clone());
                return res;
              });
            })
            .catch(function (err) {
              return caches.open(CACHE_STATIC_NAME).then(function (cache) {
                // event.request.url.indexOf("/help")
                if (event.request.headers.get("accept").includes("text/html")) {
                  return cache.match("/offline.html");
                }
              });
            });
        }
      })
    );
  }
});

// self.addEventListener("fetch", function (event) {
//   console.log("[Service Worker] fetching something....", event);
//   event.respondWith(
//     caches.match(event.request).then(function (response) {
//       fetch(event.request)
//         .then(function (res) {
//           return caches.open(CACHE_DYNAMIC_NAME).then(function (cache) {
//             cache.put(event.request.url, res.clone());
//             return res;
//           });
//         })
//         .catch(function (err) {
//           return caches.match(event.request);
//         });
//     })
//   );
// });

// caches-only
// self.addEventListener("fetch", function (event) {
//   console.log("[Service Worker] fetching something....", event);
//   event.respondWith(caches.match(event.request));
// });

// network-only
// self.addEventListener("fetch", function (event) {
//   console.log("[Service Worker] fetching something....", event);
//   event.respondWith(fetch(event.request));
// });
