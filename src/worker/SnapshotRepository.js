import { ResourceResolver } from './ResourceResolver.js';

export class SnapshotRepository {
  #snapshots = new Map();
  async loadSnapshot(matchId, refresh = false) {
    if (refresh) this.#snapshots.delete(matchId);
    if (!this.#snapshots.has(matchId)) {
      const loading = fetch(`/matches/${matchId}/snapshot.json`, { cache: 'no-store' })
        .then(async response => {
          if (!response.ok) throw new Error(`Матч ${matchId} ещё не сохранён.`);
          const snapshot = await response.json();
          if (snapshot.id !== matchId) throw new Error('ID снимка не соответствует выбранному матчу.');
          return new ResourceResolver(snapshot.resources, self.location.origin);
        }).catch(error => { this.#snapshots.delete(matchId); throw error; });
      this.#snapshots.set(matchId, loading);
    }
    return this.#snapshots.get(matchId);
  }
}
