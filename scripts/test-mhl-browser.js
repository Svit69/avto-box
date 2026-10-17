import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { waitForCapturedPage } from './waitForCapturedPage.js';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('dialog', async dialog => { errors.push(dialog.message()); await dialog.dismiss(); });
  page.on('response', response => {
    // fonts.css is blocked by ORB on the source too; mhl.css includes the working fonts.
    if (response.status() >= 400 && !response.url().endsWith('/mhl2022/css/fonts.css')) errors.push(`${response.status()} ${response.url()}`);
    if (/\.khl\.ru\//.test(response.url()) && !response.fromServiceWorker()) errors.push(`Запрос к источнику: ${response.url()}`);
  });
  const site = process.env.TEST_SITE_URL || 'http://localhost:3000';
  await page.goto(`${site}/mhl.html?id=903207#stats`);
  await waitForCapturedPage(page);
  await page.locator('.tab-statsteams').first().waitFor();
  for (const tab of ['events', 'playbyplay', 'shotsmap', 'teams', 'statA', 'statB', 'statTeams']) {
    const button = page.locator(`.left_menu_section_item[data-id="${tab}"]`);
    await button.click();
    assert.match(await button.getAttribute('class'), /selected/);
  }
  assert.match(await page.locator('.tab-statsteams').first().innerText(), /Авто/);
  assert.match(await page.locator('.tab-statsteams').first().innerText(), /Спутник/);
  await mkdir('test-results', { recursive: true });
  await page.screenshot({ path: 'test-results/mhl-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'test-results/mhl-mobile.png', fullPage: true });
  assert.deepEqual(errors, []);
  console.log('МХЛ: вкладки, таблицы, мобильный вид и локальное воспроизведение ресурсов — OK');
} finally { await browser.close(); }
