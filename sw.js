importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDyw9pT5tkE6Jz8_aamc1oK8NZk69R3sBo",
  authDomain: "rebranding-data-mod-56340.firebaseapp.com",
  projectId: "rebranding-data-mod-56340",
  storageBucket: "rebranding-data-mod-56340.firebasestorage.app",
  messagingSenderId: "696496503983",
  appId: "1:696496503983:web:144e09ee144d518fa2e85a"
});

const messaging = firebase.messaging();
const LOGO = "https://res.cloudinary.com/diepkkeyu/image/upload/v1773517119/404042723_763352762472137_4889753537613967821_n_p3hhjh.jpg";

// FCM Background messages
messaging.onBackgroundMessage(function(payload) {
  const { title, body } = payload.notification || {};
  return self.registration.showNotification(title || 'Rebranding 🔔', {
    body: body || '',
    icon: LOGO,
    badge: LOGO,
    dir: 'rtl',
    lang: 'ar',
    vibrate: [200, 100, 200],
    data: payload.data || {},
    actions: [{ action: 'open', title: 'فتح التطبيق' }]
  });
});

// Install - skip waiting immediately, delete ALL caches
self.addEventListener('install', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.skipWaiting())
  );
});

// Activate - delete ALL caches, claim clients
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Fetch - pass through everything, NO caching at all
self.addEventListener('fetch', () => {});

// Notification click
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(cs => {
        for (const c of cs) {
          if (c.url && 'focus' in c) return c.focus();
        }
        if (clients.openWindow) return clients.openWindow('/');
      })
  );
});
