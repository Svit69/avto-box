import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => {
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
    if (/\.khl\.ru\//.test(response.url()) && !response.fromServiceWorker()) {
      errors.push(`Ресурс загружен из сети КХЛ: ${response.url()}`);
    }
  });
  await page.goto('http://localhost:3000/mirror.html?id=902144&view=archive#stats');
  await page.waitForURL('**/mirror.html?id=902144#stats');
  await page.locator('.table__instance tbody tr').first().waitFor();
  for (const tab of ['events', 'play-by-play', 'shots-map', 'roster', 'stats']) {
    const button = page.locator(`.text-broadcast-tabs [data-tab="${tab}"]`);
    await button.click();
    await page.waitForTimeout(400);
    assert.equal(await button.getAttribute('aria-selected'), 'true');
  }
  const hideScore = page.getByRole('button', { name: 'Скрыть счёт', exact: true }).first();
  await hideScore.click();
  await page.getByRole('button', { name: 'Показать счёт', exact: true }).first().waitFor();
  await page.getByRole('button', { name: 'Показать счёт', exact: true }).first().click();
  await mkdir('test-results', { recursive: true });
  await page.screenshot({ path: 'test-results/desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'test-results/mobile.png', fullPage: true });
  assert.match(await page.locator('body').innerText(), /Автомобилист/);
  assert.deepEqual(errors, []);
  console.log('Chrome: вкладки, скрытие счёта, мобильный вид, ресурсы и JS — OK');
} finally {
  await browser.close();
}
