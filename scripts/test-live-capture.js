import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage();
  const site = process.env.TEST_SITE_URL || 'http://localhost:3000';
  const id = process.env.TEST_MATCH_ID || '902107';
  let captures = 0;
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (request.url().includes('/api/capture?id=')) captures += 1; });
  await page.goto(`${site}/mirror.html?id=${id}#stats`);
  await page.locator('.archive-notice time').waitFor({ timeout: 150000 });
  const capturedAt = await page.locator('.archive-notice time').getAttribute('datetime');
  assert.ok((await page.locator('.archive-notice a').getAttribute('href')).includes(`/${id}/`));
  assert.equal(captures, 1);
  assert.ok(await page.locator('.table__instance tbody tr').count() > 30);
  console.log(`Матч ${id}: ${await page.title()}, снимок ${capturedAt}`);
  await page.getByRole('button', { name: 'Обновить снимок', exact: true }).click();
  await page.locator('#status').waitFor();
  await page.locator('.archive-notice time').waitFor({ timeout: 150000 });
  const updatedAt = await page.locator('.archive-notice time').getAttribute('datetime');
  assert.ok(new Date(updatedAt) > new Date(capturedAt));
  assert.equal(captures, 2);
  assert.deepEqual(errors, []);
  console.log(`Снимок обновлён по запросу: ${updatedAt}`);
} finally { await browser.close(); }
