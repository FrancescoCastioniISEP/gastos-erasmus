// Guarda a app no telemóvel para abrir sem internet. Os dados (api.github.com) nunca passam por aqui.
const CACHE = "gastos-erasmus-v1";
const FICHEIROS = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHEIROS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== self.location.origin) return;
  // Mostra já a versão guardada e atualiza-a em segundo plano (a versão nova aparece na abertura seguinte).
  e.respondWith(caches.open(CACHE).then(async cache => {
    const guardado = await cache.match(e.request, { ignoreSearch: true });
    const rede = fetch(e.request).then(r => { if (r.ok) cache.put(e.request, r.clone()); return r; }).catch(() => guardado);
    return guardado || rede;
  }));
});
