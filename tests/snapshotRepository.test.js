import test from 'node:test';
import assert from 'node:assert/strict';
import { SnapshotRepository } from '../src/worker/SnapshotRepository.js';

test('match API archives stay isolated and navigation refreshes the manifest', async context => {
  globalThis.self = { location: { origin: 'https://avto-box.vercel.app' } };
  const originalFetch = globalThis.fetch;
  context.after(() => { delete globalThis.self; globalThis.fetch = originalFetch; });
  let calls = 0;
  globalThis.fetch = async input => {
    const id = input.match(/\/matches\/(\d+)\//)[1];
    calls += 1;
    const snapshot = { id, resources: {
      'https://www.khl.ru/rest/game/text/': { path: `/matches/${id}/revision-${calls}.json` },
    } };
    return { ok: true, json: async () => snapshot };
  };
  const repository = new SnapshotRepository({ readSnapshot: async () => null });
  const [first, second] = await Promise.all(['902140', '902144'].map(id => repository.loadSnapshot(id)));
  const url = 'https://avto-box.vercel.app/rest/game/text/';
  assert.equal(first.resolveResource(url).path, '/matches/902140/revision-1.json');
  assert.equal(second.resolveResource(url).path, '/matches/902144/revision-2.json');
  assert.equal(await repository.loadSnapshot('902140'), first);
  assert.equal(calls, 2);
  const updated = await repository.loadSnapshot('902140', true);
  assert.equal(updated.resolveResource(url).path, '/matches/902140/revision-3.json');
});
