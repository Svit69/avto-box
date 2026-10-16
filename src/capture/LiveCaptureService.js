import { MemoryResourceArchive } from './MemoryResourceArchive.js';
import { prepareDocument } from './prepareDocument.js';
import { MatchSelection } from '../shared/MatchSelection.js';

export class LiveCaptureService {
  #provider;
  constructor(provider) { this.#provider = provider; }
  async captureMatch(id, report) {
    const match = new MatchSelection(id);
    report({ kind: 'progress', message: `Открываем матч ${match.id} в браузере…` });
    const archive = new MemoryResourceArchive(report);
    const original = await this.#provider.capturePage(match.sourceUrl, archive);
    const resources = archive.getResources();
    if (Object.keys(resources).length < 30) throw new Error('Страница загружена не полностью. Предыдущий снимок сохранён.');
    const capturedAt = new Date().toISOString();
    const html = await prepareDocument(original, match.sourceUrl, capturedAt);
    report({ kind: 'snapshot', id: match.id, sourceUrl: match.sourceUrl, capturedAt, resources, html });
  }
}
