import { BrowserPageProvider } from '../src/capture/BrowserPageProvider.js';
import { CaptureService } from '../src/capture/CaptureService.js';
import { MatchSelection } from '../src/shared/MatchSelection.js';

const captureService = new CaptureService(new BrowserPageProvider());
try {
  const ids = process.argv.slice(2);
  for (const id of ids.length ? ids : ['902144']) {
    await captureService.saveSnapshot(new MatchSelection(id).sourceUrl);
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
