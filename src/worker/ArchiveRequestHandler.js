import { MatchSelection } from '../shared/MatchSelection.js';
import { SnapshotRepository } from './SnapshotRepository.js';
import { createArchiveErrorResponse } from './createArchiveErrorResponse.js';

export class ArchiveRequestHandler {
  #repository = new SnapshotRepository();
  async handleRequest(event) {
    const url = new URL(event.request.url);
    if (event.request.mode === 'navigate' && url.pathname === '/mirror.html') {
      try {
        if (!url.searchParams.has('id')) return fetch('/index.html', { cache: 'no-store' });
        const match = MatchSelection.fromUrl(url);
        await this.#repository.loadSnapshot(match.id, true);
        return fetch(`/matches/${match.id}/mirror.html`, { cache: 'no-store' });
      } catch (error) {
        return createArchiveErrorResponse(error.message);
      }
    }
    const client = event.clientId ? await self.clients.get(event.clientId) : null;
    if (client && new URL(client.url).pathname === '/mirror.html') {
      try {
        const match = MatchSelection.fromUrl(client.url);
        const resolver = await this.#repository.loadSnapshot(match.id);
        const resource = resolver.resolveResource(event.request.url);
        if (resource) {
          const response = await fetch(resource.path);
          const encoded = await response.json();
          const body = Uint8Array.from(atob(encoded.body), character => character.charCodeAt(0));
          return new Response(body, { headers: { 'Content-Type': resource.type } });
        }
      } catch (error) {
        return createArchiveErrorResponse(error.message, 503);
      }
    }
    if (url.origin === self.location.origin) return fetch(event.request);
    return new Response('', { status: 404 });
  }
}
