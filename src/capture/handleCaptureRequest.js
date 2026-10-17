import { createCaptureProvider } from './createCaptureProvider.js';
import { LiveCaptureService } from './LiveCaptureService.js';
import { MatchSelection } from '../shared/MatchSelection.js';
import { describeCaptureError } from './describeCaptureError.js';

export async function handleCaptureRequest(request, response, league) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Используйте POST.' });
  }
  let match;
  try { match = new MatchSelection(new URL(request.url, 'http://localhost').searchParams.get('id'), league); }
  catch (error) { return response.status(400).json({ error: error.message }); }
  response.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Accel-Buffering', 'no');
  response.flushHeaders?.();
  const heartbeat = setInterval(() => response.write('{"kind":"heartbeat"}\n'), 5000);
  try {
    await new LiveCaptureService(await createCaptureProvider()).captureMatch(match.id, event => {
      response.write(`${JSON.stringify(event)}\n`);
    }, league);
  } catch (error) {
    console.error('Capture failed:', error.message.replace(/wss?:\/\/\S+/g, '[browser endpoint]'));
    response.write(`${JSON.stringify(describeCaptureError(error, match.label))}\n`);
  } finally {
    clearInterval(heartbeat);
    response.end();
  }
}
