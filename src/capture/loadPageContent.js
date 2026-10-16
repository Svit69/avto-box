import { loadHiddenImages } from './loadHiddenImages.js';

export async function loadPageContent(page, sourceUrl) {
  await page.goto(sourceUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  try {
    await page.locator('.text-broadcast-tabs').waitFor({ timeout: 45000 });
    await page.locator('.table__instance tbody tr').first().waitFor({ timeout: 15000 });
  } catch {
    const message = (await page.locator('body').innerText()).slice(0, 500);
    throw new Error(`Не удалось загрузить матч. Снимок не заменён. ${message}`);
  }
  for (const tab of ['events', 'play-by-play', 'shots-map', 'roster', 'stats']) {
    await page.locator(`.text-broadcast-tabs [data-tab="${tab}"]`).click();
    await page.waitForTimeout(1500);
  }
  await page.evaluate(async () => {
    for (let offset = 0; offset < document.body.scrollHeight; offset += 800) {
      window.scrollTo(0, offset);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(2500);
  await loadHiddenImages(page);
}
