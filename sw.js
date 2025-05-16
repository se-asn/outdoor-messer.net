// Service Worker for outdoor-messer.net
const CACHE_NAME = "outdoor-messer-cache-v1";
const STATIC_CACHE_NAME = "outdoor-messer-static-v1";
const DYNAMIC_CACHE_NAME = "outdoor-messer-dynamic-v1";
const IMAGE_CACHE_NAME = "outdoor-messer-images-v1";

// Assets to precache for core experience
const CORE_ASSETS = [
  "/",
  "/index.html",
  "/css/bundle.min.css", // Updated to use minified version
  "/js/main.min.js", // Updated to use minified version
  "/manifest.json",
  "/404.html",
  "/offline.html", // Added offline fallback page
];

// Extended assets to cache if network allows
const EXTENDED_ASSETS = [
  "/images/logo.webp",
  "/images/icons/android-icon-192x192.png",
  "/images/messer/moraknife.webp",
  "/images/messer/opinel-no8.webp",
  "/images/messer/buck-110.webp",
  "/favicon.ico",
];

// Installation - Cache critical resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log("Precaching core assets");
      return cache.addAll(CORE_ASSETS);
    })
  );

  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Aktivierung - Cache-Verwaltung mit Versionshandling
self.addEventListener("activate", (event) => {
  const cacheAllowlist = [
    STATIC_CACHE_NAME,
    DYNAMIC_CACHE_NAME,
    IMAGE_CACHE_NAME,
  ];

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheAllowlist.indexOf(cacheName) === -1) {
              console.log("Deleting outdated cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("Service Worker activated and controlling the page");
        return self.clients.claim(); // Take control of uncontrolled clients
      })
  );
});

// Advanced caching strategies based on request type
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  // Handle different types of requests with appropriate strategies

  // 1. HTML navigation - Network first with cache fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches
            .open(DYNAMIC_CACHE_NAME)
            .then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || caches.match("/offline.html");
          });
        })
    );
    return;
  }

  // 2. Image requests - Cache first with network fallback
  if (request.destination === "image") {
    event.respondWith(
      caches
        .match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            // Refresh cache in the background (stale-while-revalidate)
            fetch(request)
              .then((networkResponse) => {
                if (networkResponse.ok) {
                  caches
                    .open(IMAGE_CACHE_NAME)
                    .then((cache) => cache.put(request, networkResponse));
                }
              })
              .catch(() => {});

            return cachedResponse;
          }

          // If not in cache, get from network and cache
          return fetch(request).then((networkResponse) => {
            const responseClone = networkResponse.clone();
            caches
              .open(IMAGE_CACHE_NAME)
              .then((cache) => cache.put(request, responseClone));
            return networkResponse;
          });
        })
        .catch(() => {
          // If both cache and network fail, return a placeholder
          if (request.url.match(/\.(jpg|jpeg|png|gif|webp|avif)$/)) {
            return new Response(
              '<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">' +
                '<rect width="400" height="300" fill="#cccccc"/>' +
                '<text x="50%" y="50%" font-family="sans-serif" font-size="24" text-anchor="middle" fill="#333333">' +
                "Bild nicht verfügbar" +
                "</text></svg>",
              {
                headers: { "Content-Type": "image/svg+xml" },
              }
            );
          }
        })
    );
    return;
  }

  // 3. Static assets (CSS, JS) - Cache first, network fallback
  if (request.destination === "script" || request.destination === "style") {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        return (
          cachedResponse ||
          fetch(request).then((networkResponse) => {
            const responseClone = networkResponse.clone();
            caches
              .open(STATIC_CACHE_NAME)
              .then((cache) => cache.put(request, responseClone));
            return networkResponse;
          })
        );
      })
    );
    return;
  }

  // 4. Default for all other requests - Network first with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        const responseClone = response.clone();
        caches
          .open(DYNAMIC_CACHE_NAME)
          .then((cache) => cache.put(request, responseClone));
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});

// Listen for messages from clients
self.addEventListener("message", (event) => {
  if (event.data.action === "skipWaiting") {
    self.skipWaiting();
  }
});

// Background sync für die Kontaktformular-Übermittlung
self.addEventListener("sync", (event) => {
  if (event.tag === "contact-form-submission") {
    event.waitUntil(sendPendingMessages());
  }
});

// Funktion zum Senden gespeicherter Kontaktformular-Nachrichten
async function sendPendingMessages() {
  // Diese Funktion würde tatsächlich IndexedDB nutzen, um gespeicherte Formulare zu finden und zu senden
  // Hier vereinfacht dargestellt
  const db = await openDB("contact-form-store", 1);
  const messages = await db.getAll("outbox");

  for (const message of messages) {
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        body: JSON.stringify(message),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        await db.delete("outbox", message.id);
      }
    } catch (error) {
      // Wenn der Versuch fehlschlägt, behalten wir die Nachricht für den nächsten Versuch
      console.error("Nachrichtenversand fehlgeschlagen:", error);
      return;
    }
  }
}

// Offline sync manager for form submissions
self.addEventListener("sync", (event) => {
  if (event.tag === "submit-form") {
    event.waitUntil(syncFormData());
  }
});

// Function to sync stored form data when back online
async function syncFormData() {
  try {
    const db = await openDatabase();
    const offlineData = await db.getAll("offlineForms");

    for (const formData of offlineData) {
      try {
        const response = await fetch(formData.url, {
          method: formData.method,
          headers: formData.headers,
          body: formData.body,
        });

        if (response.ok) {
          await db.delete("offlineForms", formData.id);
        }
      } catch (error) {
        console.error("Failed to sync form data:", error);
      }
    }
  } catch (error) {
    console.error("Error in syncFormData:", error);
  }
}

// Helper function to manage IndexedDB
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("OutdoorMesserOfflineDB", 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("offlineForms")) {
        db.createObjectStore("offlineForms", {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };

    request.onsuccess = (event) =>
      resolve({
        getAll: (storeName) => {
          return new Promise((resolve, reject) => {
            const transaction = event.target.result.transaction(
              storeName,
              "readonly"
            );
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
          });
        },
        delete: (storeName, id) => {
          return new Promise((resolve, reject) => {
            const transaction = event.target.result.transaction(
              storeName,
              "readwrite"
            );
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
          });
        },
      });

    request.onerror = (event) => reject(event.target.error);
  });
}
