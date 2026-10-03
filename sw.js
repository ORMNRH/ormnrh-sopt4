// สพท.4 Report wrapper service worker: keeps the app shell (this page + icons) so the installed app opens instantly.
// The report data itself always comes live from Apps Script inside the iframe - nothing about reports is cached here.
const V = 'sopt4-shell-v1';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-180.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(V).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;            // never touch Google / Apps Script traffic
  e.respondWith(fetch(r).then((res) => { if (res.ok && !u.pathname.endsWith('.pdf')) { const cp = res.clone(); caches.open(V).then((c) => c.put(r, cp)); } return res; })
    .catch(() => caches.match(r).then((m) => m || caches.match('index.html'))));   // network first, shell as fallback
});
