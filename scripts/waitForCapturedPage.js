export async function waitForCapturedPage(page) {
  await page.waitForFunction(() => document.querySelector('.archive-notice time')
    || document.getElementById('status')?.textContent.startsWith('Не удалось'), { timeout: 180000 });
  const failure = await page.locator('#status').textContent().catch(() => null);
  if (failure?.startsWith('Не удалось')) throw new Error(failure);
  await page.locator('.archive-notice button').waitFor();
}
