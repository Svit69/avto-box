import test from 'node:test';
import assert from 'node:assert/strict';
import { TextEncoder } from 'node:util';
import { readCaptureStream } from '../src/client/readCaptureStream.js';

function createStreamResponse(text) {
  const bytes = new TextEncoder().encode(text);
  let offset = 0;
  let released = false;
  return { ok: true, body: { getReader: () => ({
    read: async () => offset < bytes.length
      ? { value: bytes.slice(offset, ++offset), done: false } : { done: true },
    releaseLock: () => { released = true; },
  }) }, isReleased: () => released };
}
test('stream preserves Russian Unicode across arbitrary network chunk boundaries', async () => {
  const events = [];
  const response = createStreamResponse('{"kind":"progress","message":"Сохраняем матч"}\n{"kind":"snapshot","id":"902107"}');
  await readCaptureStream(response, event => events.push(event));
  assert.equal(events[0].message, 'Сохраняем матч');
  assert.equal(events[1].id, '902107');
  assert.equal(response.isReleased(), true);
});
test('stream errors propagate and release the reader', async () => {
  const response = createStreamResponse('{"kind":"error","message":"Блокировка"}\n');
  await assert.rejects(readCaptureStream(response, event => { throw new Error(event.message); }), /Блокировка/);
  assert.equal(response.isReleased(), true);
});
