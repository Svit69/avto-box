import { ResourceResolver } from './ResourceResolver.js';

const snapshotPromise = fetch('/snapshot.json', { cache: 'no-store' })
  .then(response => response.json())
  .then(snapshot => new ResourceResolver(snapshot.resources, self.location.origin));
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.origin === self.location.origin && /^\/(assets|client|worker|shared)\//.test(url.pathname)) return;
  if (event.request.mode === 'navigate' && url.origin !== self.location.origin) return;
  event.respondWith(resolveArchivedResponse(event.request));
});
async function resolveArchivedResponse(request) {
  const resolver = await snapshotPromise;
  const resource = resolver.resolveResource(request.url);
  if (resource) {
    const response = await fetch(resource.path);
    const encoded = await response.json();
    const body = Uint8Array.from(atob(encoded.body), character => character.charCodeAt(0));
    return new Response(body, {
      status: 200, headers: { 'Content-Type': resource.type },
    });
  }
  if (new URL(request.url).origin === self.location.origin) return fetch(request);
  return new Response('', { status: 404 });
}
