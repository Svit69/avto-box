import { MemoryResourceArchive } from './MemoryResourceArchive.js';
import { prepareDocument } from './prepareDocument.js';
import { MatchSelection } from '../shared/MatchSelection.js';

export class LiveCaptureService {
  #provider;
  constructor(provider) { this.#provider = provider; }
  async captureMatch(id, report, league = 'khl') {
    const match = new MatchSelection(id, league);
    report({ kind: 'progress', message: `Открываем матч ${match.label} ${match.id} в браузере…` });
    const archive = new MemoryResourceArchive(report);
    const original = await this.#provider.capturePage(match.sourceUrl, archive);
    const resources = archive.getResources();
    if (league === 'mhl' && !['/css/mhl.css', '/js/mhl.js'].every(path => Object.keys(resources).some(url => new URL(url).pathname === path))) {
      throw new Error('Не удалось сохранить оформление или скрипт МХЛ. Предыдущий снимок сохранён.');
    }
    if (Object.keys(resources).length < (league === 'mhl' ? 5 : 30)) throw new Error('Страница загружена не полностью. Предыдущий снимок сохранён.');
    const capturedAt = new Date().toISOString();
    const html = await prepareDocument(original, match.sourceUrl, capturedAt);
    report({ kind: 'snapshot', id: match.id, league, sourceUrl: match.sourceUrl, capturedAt, resources, html });
  }
}
