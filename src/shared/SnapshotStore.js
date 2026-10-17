export class SnapshotStore {
  #database;
  async #openDatabase() {
    if (!this.#database) this.#database = new Promise((resolve, reject) => {
      const request = indexedDB.open('avto-box-snapshots', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('snapshots', { keyPath: 'id' });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return this.#database;
  }
  async readSnapshot(id, league = 'khl') {
    const database = await this.#openDatabase();
    return new Promise((resolve, reject) => {
      const store = database.transaction('snapshots').objectStore('snapshots');
      const request = store.get(`${league}:${id}`);
      request.onsuccess = () => {
        if (request.result || league !== 'khl') return resolve(request.result);
        const legacy = store.get(id);
        legacy.onsuccess = () => resolve(legacy.result);
        legacy.onerror = () => reject(legacy.error);
      };
      request.onerror = () => reject(request.error);
    });
  }
  async saveSnapshot(snapshot) {
    const database = await this.#openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction('snapshots', 'readwrite');
      transaction.objectStore('snapshots').put({ ...snapshot, matchId: snapshot.id,
        id: `${snapshot.league || 'khl'}:${snapshot.id}` });
      transaction.oncomplete = () => resolve();
      transaction.onabort = transaction.onerror = () => reject(transaction.error || new Error('Снимок не сохранён.'));
    });
  }
}
