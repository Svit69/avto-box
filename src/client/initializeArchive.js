import { MatchPreferences } from './MatchPreferences.js';
import { MatchSelection } from '../shared/MatchSelection.js';

class ArchivePage {
  initializePage() {
    const match = MatchSelection.fromUrl(window.location.href);
    if (window.location.pathname === '/mirror.html' && !new URL(window.location.href).searchParams.has('id')) {
      window.location.replace(match.mirrorUrl);
      return;
    }
    new MatchPreferences().initializePreferences();
    const timestamp = document.querySelector('.archive-notice time');
    timestamp.textContent = new Date(timestamp.dateTime).toLocaleString('ru-RU', { timeZone: 'Asia/Yekaterinburg' }) + ' (Екб)';
    document.querySelectorAll('[data-archive-form]').forEach(form => {
      form.addEventListener('submit', event => {
        event.preventDefault();
        alert('Это сохранённая копия. Подписаться можно на сайте КХЛ.');
      }, true);
    });
  }
}
new ArchivePage().initializePage();
