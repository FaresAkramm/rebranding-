importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Firebase config
firebase.initializeApp({
  apiKey: "AIzaSyDyw9pT5tkE6Jz8_aamc1oK8NZk69R3sBo",
  authDomain: "rebranding-data-mod-56340.firebaseapp.com",
  projectId: "rebranding-data-mod-56340",
  storageBucket: "rebranding-data-mod-56340.firebasestorage.app",
  messagingSenderId: "696496503983",
  appId: "1:696496503983:web:144e09ee144d518fa2e85a"
});

const messaging = firebase.messaging();
const LOGO = "https://raw.githubusercontent.com/FaresAkramm/photo/main/re-branding.jpg";
const CACHE = 'rebranding-v3';

// Background messages من FCM
messaging.onBackgroundMessage(function(payload) {
  const {title, body} = payload.notification || {};
  return self.registration.showNotification(title || 'Rebranding 🔔', {
    body: body || '',
    icon: LOGO,
    badge: LOGO,
    dir: 'rtl',
    lang: 'ar',
    vibrate: [200, 100, 200],
    data: payload.data || {},
    actions: [{action: 'open', title: 'فتح التطبيق'}]
  });
});

// Cache
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
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  if (url.includes('firestore') || url.includes('firebase') || url.includes('telegram') || url.includes('cloudinary')) return;
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then(res => {
      caches.open(CACHE).then(c => c.put(e.request, res.clone()));
      return res;
    }).catch(() => caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then(cached => {
    if (cached) return cached;
    return fetch(e.request).then(res => {
      if (res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone()));
      return res;
    });
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({type: 'window'}).then(cs => {
    for (const c of cs) { if (c.url && 'focus' in c) return c.focus(); }
    if (clients.openWindow) return clients.openWindow('/');
  }));
});
