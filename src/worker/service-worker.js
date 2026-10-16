import { ArchiveRequestHandler } from './ArchiveRequestHandler.js';

const requestHandler = new ArchiveRequestHandler();
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.origin === self.location.origin && /^\/(assets|matches|client|worker|shared)\//.test(url.pathname)) return;
  if (event.request.mode === 'navigate' && url.origin !== self.location.origin) return;
  event.respondWith(requestHandler.handleRequest(event));
});
