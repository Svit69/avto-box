import { MatchPreferences } from './MatchPreferences.js';

class ArchivePage {
  initializePage() {
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
