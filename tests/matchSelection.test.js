import test from 'node:test';
import assert from 'node:assert/strict';
import { MatchSelection } from '../src/shared/MatchSelection.js';

test('query ID selects the requested match and creates a canonical statistics link', () => {
  const match = MatchSelection.fromUrl('https://avto-box.vercel.app/mirror.html?id=902140#stats');
  assert.equal(match.id, '902140');
  assert.equal(match.sourceUrl, 'https://www.khl.ru/game/1436/902140/text/#stats');
  assert.equal(match.mirrorUrl, '/khl.html?id=902140#stats');
});
test('old links keep the default match; ID appended after hash is accepted', () => {
  assert.equal(MatchSelection.fromUrl('/mirror.html#stats').id, '902144');
  assert.equal(MatchSelection.fromUrl('/mirror.html#stats?id=902140').id, '902140');
  assert.equal(MatchSelection.fromUrl('/mirror.html#stats+902140').id, '902140');
});
test('invalid identifiers and path traversal are rejected instead of selecting another match', () => {
  for (const id of ['', '0', '-1', '../902144', 'abc', '1.5', '12345678901']) {
    assert.throws(() => new MatchSelection(id));
  }
});
