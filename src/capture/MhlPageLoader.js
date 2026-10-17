import { PageContentLoader } from './PageContentLoader.js';

export class MhlPageLoader extends PageContentLoader {
  async prepareContent(page) {
    await page.locator('.game_info').waitFor({ timeout: 30000 });
    await page.locator('.left_menu_section_item[data-id="statTeams"]').waitFor();
    for (const tab of ['events', 'playbyplay', 'shotsmap', 'teams', 'statA', 'statB', 'statTeams']) {
      await page.locator(`.left_menu_section_item[data-id="${tab}"]`).click();
      await page.waitForTimeout(350);
    }
    await page.locator('.tab-statsteams table tbody tr').first().waitFor();
    await page.evaluate(() => {
      document.querySelectorAll('img[loading="lazy"]').forEach(image => image.loading = 'eager');
      if (window.jQuery?.fn.dataTable) window.jQuery.fn.dataTable.tables({ api: true }).destroy();
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1500);
  }
}
