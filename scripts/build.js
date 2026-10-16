import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';

const snapshot = JSON.parse(await readFile('public/snapshot/snapshot.json', 'utf8'));
if (!snapshot.capturedAt || !snapshot.resources) throw new Error('Сначала выполните npm run capture.');
await mkdir('dist', { recursive: true });
await cp('public/snapshot', 'dist', { recursive: true });
for (const file of ['index.html', 'archive.css']) await cp(`public/${file}`, `dist/${file}`);
for (const directory of ['client', 'worker', 'shared']) {
  await cp(`src/${directory}`, `dist/${directory}`, { recursive: true });
}
await writeFile('dist/robots.txt', 'User-agent: *\nDisallow: /\n', 'utf8');
console.log(`Готово. Снимок от ${snapshot.capturedAt}, ресурсов: ${Object.keys(snapshot.resources).length}`);
