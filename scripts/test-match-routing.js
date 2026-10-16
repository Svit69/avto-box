import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const context = await browser.newContext();
  const errors = [];
  context.on('page', page => page.on('pageerror', error => errors.push(error.message)));
  const pages = await Promise.all(['902140', '902144'].map(async id => {
    const page = await context.newPage();
    await page.goto(`http://localhost:3000/mirror.html?id=${id}#stats`);
    await page.locator('.table__instance tbody tr').first().waitFor().catch(async error => {
      console.error(id, page.url(), (await page.locator('body').innerText()).slice(0, 1500), errors);
      throw error;
    });
    const source = await page.locator('.archive-notice a').getAttribute('href');
    assert.ok(source.includes(`/${id}/`));
    return { page, id, title: await page.title() };
  }));
  assert.notEqual(pages[0].title, pages[1].title);
  for (const { page, id, title } of pages) {
    await page.reload();
    await page.locator('.table__instance tbody tr').first().waitFor();
    assert.equal(await page.title(), title);
    const data = await page.evaluate(async () => {
      const response = await fetch('/rest/game/text/', { method: 'POST' });
      return response.json();
    });
    assert.equal(String(data.data.game.info.data.id), id);
    console.log(`Матч ${id}: ${title}`);
  }
  const page = pages[0].page;
  await page.goto('http://localhost:3000/mirror.html#stats+902140');
  await page.waitForURL('**/mirror.html?id=902140#stats');
  await page.goto('http://localhost:3000/mirror.html?id=999999999#stats');
  assert.match(await page.locator('body').innerText(), /ещё не сохранён/);
  assert.equal(await page.locator('.table__instance').count(), 0);
  assert.deepEqual(errors, []);
  console.log('Разные ID, параллельные вкладки, API, перезагрузка и неизвестный матч — OK');
} finally {
  await browser.close();
}
