export const dynamic = 'force-static';

// Caches only hashed Next.js static assets. Pages and API calls always go to the network,
// so listings, messages and prices are never served stale.
const SW_SOURCE = `
const CACHE = 'suqly-static-v1';
self.addEventListener('install', (event) => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith('/_next/static/')) return;
  event.respondWith(
    caches.open(CACHE).then((cache) =>
      cache.match(req).then((hit) => {
        if (hit) return hit;
        return fetch(req).then((res) => {
          if (res.ok) cache.put(req, res.clone());
          return res;
        });
      })
    )
  );
});
`;

export function GET() {
  return new Response(SW_SOURCE, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Service-Worker-Allowed': '/',
    },
  });
}
