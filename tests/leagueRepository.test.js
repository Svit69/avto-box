import test from 'node:test';
import assert from 'node:assert/strict';
import { SnapshotRepository } from '../src/worker/SnapshotRepository.js';

test('repository keeps the same numeric ID isolated by league', async context => {
  globalThis.self = { location: { origin: 'https://avto-box.vercel.app' } };
  context.after(() => { delete globalThis.self; });
  const repository = new SnapshotRepository({ readSnapshot: async (id, league) => ({
    id: `${league}:${id}`, matchId: id, league,
    sourceUrl: league === 'mhl' ? `https://text.mhl.khl.ru/${id}.html` : 'https://www.khl.ru',
    resources: { 'https://img.khl.ru/logo.png': { path: `/${league}.json` } },
  }) });
  const khl = await repository.loadSnapshot('903207', false, 'khl');
  const mhl = await repository.loadSnapshot('903207', false, 'mhl');
  assert.equal(khl.resolveResource('https://img.khl.ru/logo.png').path, '/khl.json');
  assert.equal(mhl.resolveResource('https://img.khl.ru/logo.png').path, '/mhl.json');
  assert.equal(await repository.loadSnapshot('903207', false, 'khl'), khl);
  assert.equal(await repository.loadSnapshot('903207', false, 'mhl'), mhl);
});
