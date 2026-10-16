import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { load } from 'cheerio';
import { SnapshotCatalog } from '../src/capture/SnapshotCatalog.js';

for (const snapshot of await new SnapshotCatalog().listSnapshots()) {
test(`match ${snapshot.id} includes its own statistics and replay resources`, async () => {
  const root = snapshot.directory;
  const html = await readFile(`${root}/mirror.html`, 'utf8');
  const document = load(html);
  assert.ok(document('title').text().length > 10);
  assert.ok(snapshot.sourceUrl.includes(`/${snapshot.id}/`));
  assert.match(document('.archive-notice a').attr('href'), new RegExp(`/${snapshot.id}/`));
  assert.equal(document('.table__instance').length, 3);
  assert.ok(document('.table__instance tbody tr').length > 30);
  assert.ok(Object.keys(snapshot.resources).length > 30);
  for (const resource of Object.values(snapshot.resources)) {
    const encoded = JSON.parse(await readFile(`${root}${resource.path}`, 'utf8'));
    assert.ok(Buffer.from(encoded.body, 'base64').length > 0);
  }
  assert.doesNotMatch(html, /<script[^>]+src="[^"]*(?:metrika|revive)/);
});
}
