import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { load } from 'cheerio';

test('saved page includes real match statistics and all replay resources exist', async () => {
  const root = 'public/snapshot';
  const snapshot = JSON.parse(await readFile(`${root}/snapshot.json`, 'utf8'));
  const html = await readFile(`${root}/mirror.html`, 'utf8');
  const document = load(html);
  assert.match(document('title').text(), /Авангард.*Автомобилист/);
  assert.equal(document('.table__instance').length, 3);
  assert.ok(document('.table__instance tbody tr').length > 30);
  assert.ok(Object.keys(snapshot.resources).length > 30);
  for (const resource of Object.values(snapshot.resources)) {
    const encoded = JSON.parse(await readFile(`${root}${resource.path}`, 'utf8'));
    assert.ok(Buffer.from(encoded.body, 'base64').length > 0);
  }
  assert.doesNotMatch(html, /<script[^>]+src="[^"]*(?:metrika|revive)/);
});
