import { KhlPageLoader } from './KhlPageLoader.js';
import { MhlPageLoader } from './MhlPageLoader.js';

export async function loadPageContent(page, sourceUrl) {
  const loader = new URL(sourceUrl).hostname === 'text.mhl.khl.ru' ? new MhlPageLoader() : new KhlPageLoader();
  await loader.loadContent(page, sourceUrl);
}
