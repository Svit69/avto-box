import { createCaptureProvider } from '../src/capture/createCaptureProvider.js';
import { LiveCaptureService } from '../src/capture/LiveCaptureService.js';
import { MatchSelection } from '../src/shared/MatchSelection.js';
import { describeCaptureError } from '../src/capture/describeCaptureError.js';

export default async function captureMatchRequest(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Используйте POST.' });
  }
  let match;
  try { match = new MatchSelection(new URL(request.url, 'http://localhost').searchParams.get('id')); }
  catch (error) { return response.status(400).json({ error: error.message }); }
  response.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Accel-Buffering', 'no');
  response.flushHeaders?.();
  const heartbeat = setInterval(() => response.write('{"kind":"heartbeat"}\n'), 5000);
  try {
    await new LiveCaptureService(await createCaptureProvider()).captureMatch(match.id, event => {
      response.write(`${JSON.stringify(event)}\n`);
    });
  } catch (error) {
    console.error('Capture failed:', error.message.replace(/wss?:\/\/\S+/g, '[browser endpoint]'));
    response.write(`${JSON.stringify(describeCaptureError(error))}\n`);
  } finally {
    clearInterval(heartbeat);
    response.end();
  }
}
