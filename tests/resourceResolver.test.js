import test from 'node:test';
import assert from 'node:assert/strict';
import { ResourceResolver } from '../src/worker/ResourceResolver.js';
import { normalizeResourceUrl } from '../src/shared/normalizeResourceUrl.js';

test('API cache timestamps do not prevent replay; significant parameters remain', () => {
  const result = normalizeResourceUrl('https://www.khl.ru/api?a=1&_=123&period=2#stats');
  assert.equal(result, 'https://www.khl.ru/api?a=1&period=2');
  assert.notEqual(result, normalizeResourceUrl('https://www.khl.ru/api?a=1&period=3'));
});
test('same-origin API requests resolve to captured KHL responses', () => {
  const resource = { path: '/assets/match.json', type: 'application/json' };
  const resolver = new ResourceResolver({ 'https://www.khl.ru/api?period=1': resource }, 'https://avto-box.vercel.app');
  assert.deepEqual(resolver.resolveResource('https://avto-box.vercel.app/api?_=123&period=1'), resource);
  assert.equal(resolver.resolveResource('https://avto-box.vercel.app/api?period=2'), undefined);
});
