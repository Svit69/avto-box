import { chromium } from 'playwright';
import { PageProvider } from './PageProvider.js';
import { captureBrowserPage } from './captureBrowserPage.js';

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
    return captureBrowserPage(browser, sourceUrl, archive);
  }
}
