import { createHash } from 'node:crypto';
import { normalizeResourceUrl } from '../shared/normalizeResourceUrl.js';

export class MemoryResourceArchive {
  #resources = new Map();
  #assets = new Map();
  #pending = new Set();
  #onResource;
  constructor(onResource = () => {}) { this.#onResource = onResource; }
  recordResponse(response) {
    if (!/(^|\.)khl\.ru$/.test(new URL(response.url()).hostname) || !response.ok()) return;
    const task = this.#saveResponse(response).catch(() => {});
    this.#pending.add(task);
    task.finally(() => this.#pending.delete(task));
  }
  async #saveResponse(response) {
    const type = response.headers()['content-type'] || 'application/octet-stream';
    if (type.includes('text/html')) return;
    const body = (await response.body()).toString('base64');
    const hash = createHash('sha256').update(body).digest('hex').slice(0, 20);
    const path = `/live/assets/${hash}.json`;
    const url = normalizeResourceUrl(response.url());
    this.#resources.set(url, { path, type });
    if (!this.#assets.has(path)) {
      this.#assets.set(path, { body });
      this.#onResource({ kind: 'asset', path, body });
    }
  }
  async finishRecording() { await Promise.all([...this.#pending]); }
  getResources() { return Object.fromEntries(this.#resources); }
}
