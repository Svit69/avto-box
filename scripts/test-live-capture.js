import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { waitForCapturedPage } from './waitForCapturedPage.js';
import { MatchSelection } from '../src/shared/MatchSelection.js';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage();
  const site = process.env.TEST_SITE_URL || 'http://localhost:3000';
  const league = process.env.TEST_LEAGUE || 'khl';
  const id = process.env.TEST_MATCH_ID || (league === 'mhl' ? '903207' : '902107');
  const match = new MatchSelection(id, league);
  let captures = 0;
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (request.url().includes(match.captureUrl)) captures += 1; });
  await page.goto(`${site}${match.mirrorUrl}`);
  await waitForCapturedPage(page);
  const capturedAt = await page.locator('.archive-notice time').getAttribute('datetime');
  assert.equal(await page.locator('.archive-notice a').getAttribute('href'), match.sourceUrl);
  assert.equal(captures, 1);
  assert.ok(await page.locator(league === 'mhl' ? '.tab-statsteams tbody tr' : '.table__instance tbody tr').count() > 0);
  console.log(`Матч ${id}: ${await page.title()}, снимок ${capturedAt}`);
  await page.getByRole('button', { name: 'Обновить снимок', exact: true }).click();
  await page.locator('#status').waitFor();
  await waitForCapturedPage(page);
  const updatedAt = await page.locator('.archive-notice time').getAttribute('datetime');
  assert.ok(new Date(updatedAt) > new Date(capturedAt));
  assert.equal(captures, 2);
  assert.deepEqual(errors, []);
  console.log(`Снимок обновлён по запросу: ${updatedAt}`);
  await page.route(`**/api/${league}?id=*`, route => route.fulfill({
    contentType: 'application/x-ndjson', body: '{"kind":"error","message":"Тестовая блокировка КХЛ"}\n',
  }));
  await page.reload();
  await page.getByText(/Тестовая блокировка/).waitFor();
  await page.getByRole('link', { name: 'Показать последний снимок' }).click();
  await page.locator('.archive-notice time').waitFor();
  assert.equal(await page.locator('.archive-notice time').getAttribute('datetime'), updatedAt);
  console.log('При ошибке новый снимок не заменяет последний успешный — OK');
} finally { await browser.close(); }
