import { ServerlessPageProvider } from './ServerlessPageProvider.js';

export async function createCaptureProvider() {
  if (process.platform === 'win32' && !process.env.VERCEL) {
    const { BrowserPageProvider } = await import('./BrowserPageProvider.js');
    return new BrowserPageProvider();
  }
  return new ServerlessPageProvider();
}
