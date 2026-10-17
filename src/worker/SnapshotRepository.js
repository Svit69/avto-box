import { SnapshotDocument } from './SnapshotDocument.js';
import { SnapshotStore } from '../shared/SnapshotStore.js';

export class SnapshotRepository {
  #snapshots = new Map();
  #store;
  constructor(store = new SnapshotStore()) { this.#store = store; }
  async loadSnapshot(matchId, refresh = false, league = 'khl') {
    const key = `${league}:${matchId}`;
    if (refresh) this.#snapshots.delete(key);
    if (!this.#snapshots.has(key)) {
      const loading = this.#store.readSnapshot(matchId, league).then(snapshot => {
        if (snapshot) return snapshot;
        if (league !== 'khl') throw new Error('Снимок МХЛ недоступен. Откройте ссылку без параметра view.');
        return fetch(`/matches/${matchId}/snapshot.json`, { cache: 'no-store' })
        .then(async response => {
          if (!response.ok) throw new Error(`Матч ${matchId} ещё не сохранён.`);
          return response.json();
        });
      }).then(snapshot => {
          if ((snapshot.matchId || snapshot.id) !== matchId || (snapshot.league || 'khl') !== league) throw new Error('Снимок не соответствует выбранному матчу и лиге.');
          return new SnapshotDocument({ ...snapshot, id: matchId }, self.location.origin);
        }).catch(error => { this.#snapshots.delete(key); throw error; });
      this.#snapshots.set(key, loading);
    }
    return this.#snapshots.get(key);
  }
}
