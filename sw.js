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
const CACHE = 'rebranding-v5';

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

const STATIC = [
  'https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(STATIC.map(u => c.add(u)))));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
  self.clients.matchAll({ type: 'window' }).then(clients => {
    clients.forEach(c => c.postMessage({ type: 'UPDATE_AVAILABLE' }));
  });
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  if (
    url.includes('firestore') || url.includes('googleapis') ||
    url.includes('firebase') || url.includes('telegram') ||
    url.includes('cloudinary') || url.includes('groq') ||
    e.request.method !== 'GET'
  ) return;

  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      }).catch(() => caches.match(e.request).then(r => r || caches.match('/')))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res && res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => null);
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
      for (const c of cs) { if (c.url && 'focus' in c) return c.focus(); }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});
