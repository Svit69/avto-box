import { ResourceResolver } from './ResourceResolver.js';

export class SnapshotDocument extends ResourceResolver {
  #snapshot;
  constructor(snapshot, origin) {
    super(snapshot.resources, origin);
    this.#snapshot = snapshot;
  }
  async createDocumentResponse() {
    if (!this.#snapshot.html) return fetch(`/matches/${this.#snapshot.id}/mirror.html`, { cache: 'no-store' });
    return new Response(this.#snapshot.html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }
  async createResourceResponse(resource) {
    const encoded = this.#snapshot.assets?.[resource.path] || await (await fetch(resource.path)).json();
    const body = Uint8Array.from(atob(encoded.body), character => character.charCodeAt(0));
    return new Response(body, { headers: { 'Content-Type': resource.type } });
  }
}
