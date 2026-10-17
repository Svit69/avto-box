import { navigateToMatchPage } from './navigateToMatchPage.js';
import { loadHiddenImages } from './loadHiddenImages.js';

export class PageContentLoader {
  async loadContent(page, sourceUrl) {
    await navigateToMatchPage(page, sourceUrl);
    await this.prepareContent(page);
    await loadHiddenImages(page);
  }
  async prepareContent() { throw new Error('Загрузчик должен реализовать prepareContent().'); }
}
