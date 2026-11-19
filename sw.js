// R sters pec 01 - Service Worker (v31.2)
// ゲーム本体をキャッシュして、アプリとしてオフラインでも開けるようにする
const CACHE_NAME = 'rsp-v360';
const CORE = [
  './',
  './index.html',
  './three.min.js',
  './peerjs.min.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-180.png'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return; // オンライン対戦などの外部通信はそのまま通す
  e.respondWith(
    caches.match(e.request).then(hit => {
      if (hit) return hit;
      return fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, copy)).catch(() => {});
        return res;
      });
    })
  );
});
