import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage();
  await page.route('**/storage-test', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><html lang="ru"></html>' }));
  await page.goto('http://localhost:3000/storage-test');
  const result = await page.evaluate(async () => {
    const { SnapshotStore } = await import('/shared/SnapshotStore.js');
    const store = new SnapshotStore();
    await store.readSnapshot('902144');
    await new Promise((resolve, reject) => {
      const request = indexedDB.open('avto-box-snapshots', 1);
      request.onsuccess = () => {
        const transaction = request.result.transaction('snapshots', 'readwrite');
        transaction.objectStore('snapshots').put({ id: '902144', marker: 'legacy-khl' });
        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error);
      };
    });
    await store.saveSnapshot({ id: '903207', league: 'khl', marker: 'khl' });
    await store.saveSnapshot({ id: '903207', league: 'mhl', marker: 'mhl' });
    return [await store.readSnapshot('902144', 'khl'), await store.readSnapshot('902144', 'mhl'),
      await store.readSnapshot('903207', 'khl'), await store.readSnapshot('903207', 'mhl')];
  });
  assert.equal(result[0].marker, 'legacy-khl');
  assert.equal(result[1], undefined);
  assert.equal(result[2].marker, 'khl');
  assert.equal(result[3].marker, 'mhl');
  console.log('IndexedDB: старые снимки КХЛ доступны, одинаковые ID КХЛ и МХЛ разделены — OK');
} finally { await browser.close(); }
