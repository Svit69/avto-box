import { SnapshotDocument } from './SnapshotDocument.js';
import { SnapshotStore } from '../shared/SnapshotStore.js';

export class SnapshotRepository {
  #snapshots = new Map();
  #store;
  constructor(store = new SnapshotStore()) { this.#store = store; }
  async loadSnapshot(matchId, refresh = false) {
    if (refresh) this.#snapshots.delete(matchId);
    if (!this.#snapshots.has(matchId)) {
      const loading = this.#store.readSnapshot(matchId).then(snapshot => snapshot || fetch(`/matches/${matchId}/snapshot.json`, { cache: 'no-store' })
        .then(async response => {
          if (!response.ok) throw new Error(`Матч ${matchId} ещё не сохранён.`);
          return response.json();
        })).then(snapshot => {
          if (snapshot.id !== matchId) throw new Error('ID снимка не соответствует выбранному матчу.');
          return new SnapshotDocument(snapshot, self.location.origin);
        }).catch(error => { this.#snapshots.delete(matchId); throw error; });
      this.#snapshots.set(matchId, loading);
    }
    return this.#snapshots.get(matchId);
  }
}
