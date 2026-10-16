import { loadPageContent } from './loadPageContent.js';

export async function captureBrowserPage(browser, sourceUrl, archive) {
  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1000 }, locale: 'ru-RU',
      userAgent: `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${browser.version()} Safari/537.36`,
    });
    page.on('response', response => archive.recordResponse(response));
    await loadPageContent(page, sourceUrl);
    return await page.content();
  } finally {
    await archive.finishRecording();
    await browser.close();
  }
}
