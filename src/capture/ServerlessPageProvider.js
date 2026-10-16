import { chromium as playwright } from 'playwright-core';
import chromium from '@sparticuz/chromium';
import { PageProvider } from './PageProvider.js';
import { captureBrowserPage } from './captureBrowserPage.js';

export class ServerlessPageProvider extends PageProvider {
  async capturePage(sourceUrl, archive) {
    const endpoint = process.env.BROWSER_WS_ENDPOINT;
    const browser = endpoint ? await playwright.connectOverCDP(endpoint, { timeout: 30000 })
      : await playwright.launch({
        args: chromium.args, executablePath: await chromium.executablePath(), headless: true,
      });
    return captureBrowserPage(browser, sourceUrl, archive);
  }
}
