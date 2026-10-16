import { cp, readFile, writeFile } from 'node:fs/promises';
import { load } from 'cheerio';

export async function publishSnapshot(snapshot) {
  const destination = `dist/matches/${snapshot.id}`;
  await cp(snapshot.directory, destination, { recursive: true });
  const resources = Object.fromEntries(Object.entries(snapshot.resources)
    .map(([url, resource]) => [url, { ...resource, path: `/matches/${snapshot.id}${resource.path}` }]));
  await writeFile(`${destination}/snapshot.json`, JSON.stringify({ ...snapshot, directory: undefined, resources }), 'utf8');
  const document = load(await readFile(`${destination}/mirror.html`, 'utf8'));
  document('link[rel="icon"], link[rel="apple-touch-icon"]').remove();
  document('head').append('<link rel="icon" type="image/png" href="/favicon.png">');
  await writeFile(`${destination}/mirror.html`, document.html(), 'utf8');
}
export async function publishBrowserIcon(snapshot) {
  const entry = Object.entries(snapshot.resources).find(([url]) => url.endsWith('/favicon-32x32.png'));
  if (!entry) throw new Error('В снимке отсутствует иконка сайта.');
  const encoded = JSON.parse(await readFile(`${snapshot.directory}${entry[1].path}`, 'utf8'));
  await writeFile('dist/favicon.png', Buffer.from(encoded.body, 'base64'));
}
