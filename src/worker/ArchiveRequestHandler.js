import { MatchSelection } from '../shared/MatchSelection.js';
import { SnapshotRepository } from './SnapshotRepository.js';
import { createArchiveErrorResponse } from './createArchiveErrorResponse.js';

export class ArchiveRequestHandler {
  #repository = new SnapshotRepository();
  async handleRequest(event) {
    const url = new URL(event.request.url);
    if (event.request.mode === 'navigate' && MatchSelection.isMatchPage(url)) {
      try {
        if (!url.searchParams.has('view')) return fetch('/index.html', { cache: 'no-store' });
        const match = MatchSelection.fromUrl(url);
        const snapshot = await this.#repository.loadSnapshot(match.id, true, match.league);
        return snapshot.createDocumentResponse();
      } catch (error) {
        return createArchiveErrorResponse(error.message);
      }
    }
    const client = event.clientId ? await self.clients.get(event.clientId) : null;
    if (client && MatchSelection.isMatchPage(client.url)) {
      try {
        const match = MatchSelection.fromUrl(client.url);
        const resolver = await this.#repository.loadSnapshot(match.id, false, match.league);
        const resource = resolver.resolveResource(event.request.url);
        if (resource) {
          return resolver.createResourceResponse(resource);
        }
      } catch (error) {
        return createArchiveErrorResponse(error.message, 503);
      }
    }
    if (url.origin === self.location.origin) return fetch(event.request);
    return new Response('', { status: 404 });
  }
}
