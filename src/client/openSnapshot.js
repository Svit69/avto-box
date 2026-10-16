import { MatchSelection } from '../shared/MatchSelection.js';
import { LiveSnapshotClient } from './LiveSnapshotClient.js';
import { registerArchiveWorker } from './registerArchiveWorker.js';
import { SnapshotStore } from '../shared/SnapshotStore.js';
import { navigateToSnapshot } from './navigateToSnapshot.js';

async function openSavedMatchPage() {
  const match = MatchSelection.fromUrl(window.location.href);
  document.getElementById('source').href = match.sourceUrl;
  document.getElementById('retry').addEventListener('click', () => window.location.reload());
  await registerArchiveWorker();
  const requestedView = new URL(window.location.href).searchParams.get('view');
  if (requestedView) { navigateToSnapshot(match, requestedView); return; }
  const report = message => { document.getElementById('status').textContent = message; };
  report(`Создаём свежий снимок матча ${match.id}…`);
  const snapshot = await new LiveSnapshotClient().captureMatch(match, report);
  navigateToSnapshot(match, snapshot.capturedAt);
}
openSavedMatchPage().catch(async error => {
  document.getElementById('status').textContent = `Не удалось открыть снимок: ${error.message}`;
  document.getElementById('retry').hidden = false;
  try {
    const match = MatchSelection.fromUrl(window.location.href);
    const previous = await new SnapshotStore().readSnapshot(match.id);
    if (previous) {
      const link = document.getElementById('previous');
      link.href = `/mirror.html?id=${match.id}&view=${encodeURIComponent(previous.capturedAt)}#stats`;
      link.hidden = false;
    }
  } catch {}
});
