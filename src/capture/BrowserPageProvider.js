import { chromium } from 'playwright';
import { PageProvider } from './PageProvider.js';
import { loadPageContent } from './loadPageContent.js';

export class BrowserPageProvider extends PageProvider {
  #options;
  constructor(options = {}) {
    super();
    this.#options = options;
  }
  async capturePage(sourceUrl, archive) {
    const browser = await chromium.launch({
      channel: process.env.CHROME_CHANNEL || 'chrome',
      headless: process.env.HEADLESS === 'true',
      ...this.#options,
    });
    try {
      const page = await browser.newPage({
        viewport: { width: 1440, height: 1000 }, locale: 'ru-RU',
      });
      page.on('response', response => archive.recordResponse(response));
      await loadPageContent(page, sourceUrl);
      return await page.content();
    } finally {
      await archive.finishRecording();
      await browser.close();
    }
  }
}
