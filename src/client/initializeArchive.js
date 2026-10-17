import { MatchPreferences } from './MatchPreferences.js';
import { MatchSelection } from '../shared/MatchSelection.js';
import { registerArchiveWorker } from './registerArchiveWorker.js';
import { initializeMhlStatistics } from './initializeMhlStatistics.js';

class ArchivePage {
  async initializePage() {
    const match = MatchSelection.fromUrl(window.location.href);
    if (MatchSelection.isMatchPage(window.location.href) && !new URL(window.location.href).searchParams.has('view')) {
      await registerArchiveWorker();
      window.location.reload();
      return;
    }
    history.replaceState(null, '', match.mirrorUrl);
    const refresh = document.createElement('button');
    refresh.textContent = 'Обновить снимок';
    refresh.addEventListener('click', () => window.location.reload());
    document.querySelector('.archive-notice').append(' · ', refresh);
    new MatchPreferences().initializePreferences();
    if (match.league === 'mhl') initializeMhlStatistics();
    const timestamp = document.querySelector('.archive-notice time');
    timestamp.textContent = new Date(timestamp.dateTime).toLocaleString('ru-RU', { timeZone: 'Asia/Yekaterinburg' }) + ' (Екб)';
    document.querySelectorAll('[data-archive-form]').forEach(form => {
      form.addEventListener('submit', event => {
        event.preventDefault();
        alert(`Это сохранённая копия. Формы доступны на сайте ${match.label}.`);
      }, true);
    });
  }
}
new ArchivePage().initializePage();
