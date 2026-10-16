import { MatchSelection } from '../shared/MatchSelection.js';

async function openSavedMatchPage() {
  const match = MatchSelection.fromUrl(window.location.href);
  document.querySelector('main a').href = match.sourceUrl;
  const response = await fetch('/matches.json', { cache: 'no-store' });
  if (!response.ok) throw new Error('Не удалось загрузить список матчей.');
  const matches = await response.json();
  if (!matches.some(savedMatch => savedMatch.id === match.id)) throw new Error(`Матч ${match.id} ещё не сохранён.`);
  if (!('serviceWorker' in navigator)) throw new Error('Для просмотра необходим современный браузер и HTTPS.');
  await navigator.serviceWorker.register('/worker/service-worker.js', { scope: '/', type: 'module', updateViaCache: 'none' });
  await navigator.serviceWorker.ready;
  if (!navigator.serviceWorker.controller) {
    await new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
  }
  const destination = new URL(match.mirrorUrl, window.location.origin);
  if (window.location.href === destination.href) window.location.reload();
  else window.location.replace(destination.href);
}
openSavedMatchPage().catch(error => {
  document.getElementById('status').textContent = `Не удалось открыть снимок: ${error.message}`;
});
