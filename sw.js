// Catalyst service worker
// Handles: (1) basic offline caching of the app shell, (2) push notifications via Firebase Cloud Messaging.

const CACHE_NAME = "catalyst-shell-v1";
const SHELL_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Never cache the data JSON — it must always be fresh.
  if (event.request.url.includes("/data/")) return;

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});

// ---------------------------------------------------------------------------
// Firebase Cloud Messaging — background push handling
// ---------------------------------------------------------------------------

importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

// TODO: paste your Firebase web config here (from Firebase Console → Project
// Settings → General → Your apps → Web app). These values are safe to be
// public — they identify the project, they are not secret credentials.
firebase.initializeApp({
  apiKey: "AIzaSyB63bgKMs5atlnWwkJP7ZnSPFwNLMVT0u4",
  authDomain: "catalyst-5823f.firebaseapp.com",
  projectId: "catalyst-5823f",
  storageBucket: "catalyst-5823f.firebasestorage.app",
  messagingSenderId: "993238629123",
  appId: "1:993238629123:web:8f9b45f8de59a790600736",
  measurementId: "G-XNB4KR8P77"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "Catalyst";
  const options = {
    body: payload.notification?.body || "",
    icon: "./icons/icon-192.png",
    badge: "./icons/icon-192.png",
    data: { url: payload.data?.url || "./" },
  };
  self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "./";
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(location.origin) && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
