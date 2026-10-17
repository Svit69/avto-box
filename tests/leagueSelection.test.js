import test from 'node:test';
import assert from 'node:assert/strict';
import { MatchSelection } from '../src/shared/MatchSelection.js';
import { ResourceResolver } from '../src/worker/ResourceResolver.js';

test('MHL source and requests use the MHL league route', () => {
  const match = MatchSelection.fromUrl('/mhl.html?id=903207#stats');
  assert.equal(match.league, 'mhl');
  assert.equal(match.sourceUrl, 'https://text.mhl.khl.ru/903207.html');
  assert.equal(match.captureUrl, '/api/mhl?id=903207');
  assert.equal(match.mirrorUrl, '/mhl.html?id=903207#stats');
});
test('equal match IDs in different leagues have different storage keys', () => {
  assert.notEqual(new MatchSelection('903207', 'khl').key, new MatchSelection('903207', 'mhl').key);
  assert.equal(MatchSelection.fromUrl('/mirror.html?id=903207').league, 'khl');
  assert.equal(MatchSelection.fromUrl('/khl.html?id=903207').league, 'khl');
  assert.throws(() => new MatchSelection('903207', 'unknown'));
});
test('MHL relative resource requests resolve against the MHL source', () => {
  const resource = { path: '/live/assets/mhl.json', type: 'application/json' };
  const resolver = new ResourceResolver({ 'https://text.mhl.khl.ru/903207.json': resource },
    'https://avto-box.vercel.app', 'https://text.mhl.khl.ru');
  assert.deepEqual(resolver.resolveResource('https://avto-box.vercel.app/903207.json'), resource);
  assert.equal(resolver.resolveResource('https://www.khl.ru/903207.json'), undefined);
});
