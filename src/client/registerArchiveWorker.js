export async function registerArchiveWorker() {
  if (!('serviceWorker' in navigator)) throw new Error('Для просмотра необходим современный браузер и HTTPS.');
  const registration = await navigator.serviceWorker.register('/worker/service-worker.js', {
    scope: '/', type: 'module', updateViaCache: 'none',
  });
  const worker = registration.installing || registration.waiting;
  if (worker && worker.state !== 'activated') {
    await new Promise((resolve, reject) => worker.addEventListener('statechange', () => {
      if (worker.state === 'activated') resolve();
      if (worker.state === 'redundant') reject(new Error('Не удалось обновить просмотрщик.'));
    }));
  }
  await navigator.serviceWorker.ready;
  if (!navigator.serviceWorker.controller || navigator.serviceWorker.controller !== registration.active) {
    await new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
  }
}
