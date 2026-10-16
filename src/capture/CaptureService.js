import { mkdir, writeFile, rename, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { ResourceArchive } from './ResourceArchive.js';
import { prepareDocument } from './prepareDocument.js';
import { MatchSelection } from '../shared/MatchSelection.js';

export class CaptureService {
  #provider;
  constructor(provider) { this.#provider = provider; }
  async saveSnapshot(sourceUrl) {
    const match = new MatchSelection(new URL(sourceUrl).pathname.split('/')[3]);
    const staging = resolve('.capture', `snapshot-${Date.now()}`);
    await mkdir(`${staging}/assets`, { recursive: true });
    const archive = new ResourceArchive(staging);
    const html = await this.#provider.capturePage(sourceUrl, archive);
    const capturedAt = new Date().toISOString();
    const resources = archive.getResources();
    if (Object.keys(resources).length < 30) throw new Error('Недостаточно ресурсов для полной копии.');
    const document = await prepareDocument(html, sourceUrl, capturedAt);
    await writeFile(`${staging}/mirror.html`, document, 'utf8');
    await writeFile(`${staging}/snapshot.json`, JSON.stringify({ sourceUrl, capturedAt, resources }), 'utf8');
    const destination = resolve(match.id === '902144' ? 'public/snapshot' : `public/matches/${match.id}`);
    const backup = resolve('.capture', `backup-${Date.now()}`);
    await mkdir(resolve(destination, '..'), { recursive: true });
    await rename(destination, backup).catch(error => { if (error.code !== 'ENOENT') throw error; });
    try { await rename(staging, destination); }
    catch (error) { await rename(backup, destination).catch(() => {}); throw error; }
    await rm(backup, { recursive: true, force: true });
    console.log(`Сохранено ресурсов: ${Object.keys(resources).length}. Снимок: ${capturedAt}`);
  }
}
