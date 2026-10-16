import { readdir, readFile } from 'node:fs/promises';
import { MatchSelection } from '../shared/MatchSelection.js';

export class SnapshotCatalog {
  #root;
  constructor(root = 'public') { this.#root = root; }
  async listSnapshots() {
    const entries = await readdir(`${this.#root}/matches`, { withFileTypes: true })
      .catch(error => { if (error.code === 'ENOENT') return []; throw error; });
    const directories = [`${this.#root}/snapshot`, ...entries
      .filter(entry => entry.isDirectory() && /^[1-9]\d*$/.test(entry.name))
      .map(entry => `${this.#root}/matches/${entry.name}`)];
    const snapshots = [];
    for (const directory of directories) {
      const snapshot = JSON.parse(await readFile(`${directory}/snapshot.json`, 'utf8'));
      const match = new MatchSelection(new URL(snapshot.sourceUrl).pathname.split('/')[3]);
      if (!snapshot.capturedAt || !snapshot.resources) throw new Error(`Неполный снимок: ${directory}`);
      snapshots.push({ ...snapshot, id: match.id, directory });
    }
    return snapshots;
  }
}
