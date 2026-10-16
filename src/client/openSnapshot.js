async function openSavedMatchPage() {
  if (!('serviceWorker' in navigator)) throw new Error('Для просмотра необходим современный браузер и HTTPS.');
  await navigator.serviceWorker.register('/worker/service-worker.js', { scope: '/', type: 'module' });
  await navigator.serviceWorker.ready;
  if (!navigator.serviceWorker.controller) {
    await new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
  }
  window.location.replace(`/mirror.html${window.location.hash || '#stats'}`);
}
openSavedMatchPage().catch(error => {
  document.getElementById('status').textContent = `Не удалось открыть снимок: ${error.message}`;
});
