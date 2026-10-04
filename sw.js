// Cambia la versione quando aggiorni i file, così i telefoni scaricano la nuova copia.
const VERSION = "impostore-v5";
const FILES = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "fonts/bowlby-one-400.woff2",
  "fonts/figtree-400.woff2",
  "fonts/figtree-600.woff2",
  "fonts/figtree-700.woff2",
  "fonts/figtree-800.woff2",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/maskable-512.png",
  "icons/apple-touch-icon.png",
  "icons/favicon-32.png"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Pagina: prima la rete (per ricevere gli aggiornamenti), poi la copia salvata se sei offline.
// Altri file: prima la copia salvata, poi la rete.
self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put("index.html", copy)); return res; })
        .catch(() => caches.match("index.html"))
    );
    return;
  }
  event.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});
