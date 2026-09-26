// Çevrimdışı çalışma: uygulama dosyalarını önbelleğe alır. API istekleri her zaman ağa gider.
const CACHE = 'kpss-ozgur-v13';
const CORE = [
  '/', '/index.html', '/css/app.css', '/manifest.webmanifest', '/icons/icon.svg',
  '/js/app.js', '/js/store.js', '/js/viz.js', '/js/chat.js', '/js/plan.js', '/js/trmap.js',
  '/js/icons.js', '/js/ui.js', '/js/net.js', '/js/profile.js', '/js/text.js', '/js/yks.js', '/vendor/marked.esm.js', '/vendor/purify.es.mjs',
  '/js/content/turkce.js', '/js/content/matematik.js', '/js/content/tarih.js', '/js/content/cografya.js',
  '/js/content/vatandaslik.js', '/js/content/guncel.js', '/js/content/extra.js', '/js/content/boost.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.pathname.startsWith('/api/')) return;
  // Önce ağ (içerik güncellemeleri hemen gelsin), ağ yoksa önbellek
  e.respondWith(
    fetch(e.request).then((res) => {
      if (res.ok && (url.origin === location.origin || url.hostname.includes('fonts.g'))) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match(e.request).then((r) => r || caches.match('/index.html')))
  );
});
