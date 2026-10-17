import { createHash } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import { getResponseResourceUrls } from './getResponseResourceUrls.js';

export class ResourceArchive {
  #resources = new Map();
  #pending = new Set();
  #directory;
  constructor(directory) { this.#directory = directory; }
  recordResponse(response) {
    const hostname = new URL(response.url()).hostname;
    if (!/(^|\.)khl\.ru$/.test(hostname) || !response.ok()) return;
    const task = this.#saveResponse(response).catch(error => {
      console.warn(`Ресурс не сохранён: ${response.url()} (${error.message})`);
    });
    this.#pending.add(task);
    task.finally(() => this.#pending.delete(task));
  }
  async #saveResponse(response) {
    const body = await response.body();
    const type = response.headers()['content-type'] || 'application/octet-stream';
    if (type.includes('text/html')) return;
    const content = JSON.stringify({ body: body.toString('base64') });
    const hash = createHash('sha256').update(content).digest('hex').slice(0, 20);
    const path = `/assets/${hash}.json`;
    await writeFile(`${this.#directory}${path}`, content);
    for (const url of getResponseResourceUrls(response)) this.#resources.set(url, { path, type });
  }
  async finishRecording() { await Promise.all([...this.#pending]); }
  getResources() { return Object.fromEntries(this.#resources); }
}
