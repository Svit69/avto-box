import test from 'node:test';
import assert from 'node:assert/strict';
import { getResponseResourceUrls } from '../src/capture/getResponseResourceUrls.js';
import { normalizeResourceUrl } from '../src/shared/normalizeResourceUrl.js';

test('archived assets retain every source URL from the redirect chain', () => {
  const first = { url: () => 'http://mhl.khl.ru//bitrix/templates/mhl2016/i/bg.jpg', redirectedFrom: () => null };
  const second = { url: () => 'https://mhl.khl.ru/bitrix/templates/mhl2016/i/bg.jpg', redirectedFrom: () => first };
  const final = { redirectedFrom: () => second };
  const urls = getResponseResourceUrls({
    url: () => 'https://mhl.khl.ru/local/templates/mhl2016/i/bg.jpg', request: () => final,
  });
  assert.deepEqual(urls, ['https://mhl.khl.ru/local/templates/mhl2016/i/bg.jpg',
    'https://mhl.khl.ru/bitrix/templates/mhl2016/i/bg.jpg']);
});
test('legacy HTTP and repeated slashes match the captured HTTPS asset', () => {
  assert.equal(normalizeResourceUrl('http://mhl.khl.ru//bitrix/a.png'), 'https://mhl.khl.ru/bitrix/a.png');
});
