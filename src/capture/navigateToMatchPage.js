export async function navigateToMatchPage(page, sourceUrl) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await page.goto(sourceUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
    if (response && response.status() < 400) return;
    if (attempt < 2) await page.waitForTimeout(1500);
    else throw new Error(`SOURCE_BLOCKED: источник вернул HTTP ${response?.status()}.`);
  }
}
