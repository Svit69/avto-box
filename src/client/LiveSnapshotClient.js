import { SnapshotStore } from '../shared/SnapshotStore.js';
import { readCaptureStream } from './readCaptureStream.js';

export class LiveSnapshotClient {
  #store = new SnapshotStore();
  async captureMatch(match, report) {
    const response = await fetch(`/api/capture?id=${match.id}`, { method: 'POST', cache: 'no-store' });
    const assets = {};
    let snapshot;
    let count = 0;
    await readCaptureStream(response, event => {
      if (event.kind === 'error') throw new Error(event.message);
      if (event.kind === 'progress') report(event.message);
      if (event.kind === 'asset') {
        assets[event.path] = { body: event.body };
        report(`Сохраняем ресурсы матча ${match.id}: ${++count}…`);
      }
      if (event.kind === 'snapshot') snapshot = event;
    });
    if (!snapshot || snapshot.id !== match.id) throw new Error('Загрузка прервалась. Предыдущий снимок не изменён.');
    for (const resource of Object.values(snapshot.resources)) {
      if (!assets[resource.path]) throw new Error('Не все ресурсы снимка получены. Повторите запрос.');
    }
    await this.#store.saveSnapshot({ ...snapshot, assets });
    return snapshot;
  }
}
