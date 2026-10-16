import { BrowserPageProvider } from '../src/capture/BrowserPageProvider.js';
import { CaptureService } from '../src/capture/CaptureService.js';

const sourceUrl = 'https://www.khl.ru/game/1436/902144/text/#stats';
const captureService = new CaptureService(new BrowserPageProvider());
try {
  await captureService.saveSnapshot(sourceUrl);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
