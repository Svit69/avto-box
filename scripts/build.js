import { cp, mkdir, writeFile } from 'node:fs/promises';
import { SnapshotCatalog } from '../src/capture/SnapshotCatalog.js';
import { publishSnapshot, publishBrowserIcon } from '../src/capture/publishSnapshot.js';

const snapshots = await new SnapshotCatalog().listSnapshots();
await mkdir('dist', { recursive: true });
// Keep the previous worker's resource paths available during deployment upgrades.
await cp('public/snapshot', 'dist', { recursive: true });
for (const snapshot of snapshots) await publishSnapshot(snapshot);
await publishBrowserIcon(snapshots[0]);
await writeFile('dist/matches.json', JSON.stringify(snapshots.map(({ id, sourceUrl, capturedAt }) => ({ id, sourceUrl, capturedAt }))), 'utf8');
for (const file of ['index.html', 'archive.css']) await cp(`public/${file}`, `dist/${file}`);
await cp('public/index.html', 'dist/mirror.html');
for (const directory of ['client', 'worker', 'shared']) {
  await cp(`src/${directory}`, `dist/${directory}`, { recursive: true });
}
await writeFile('dist/robots.txt', 'User-agent: *\nDisallow: /\n', 'utf8');
console.log(`Готово. Доступные матчи: ${snapshots.map(snapshot => snapshot.id).join(', ')}`);
