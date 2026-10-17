import captureMatchRequest from '../api/capture.js';
import captureMhlMatch from '../api/mhl.js';

export async function handleLocalApiRequest(request, response) {
  response.status = code => { response.statusCode = code; return response; };
  response.json = value => {
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.end(JSON.stringify(value));
  };
  const pathname = new URL(request.url, 'http://localhost').pathname;
  await (pathname === '/api/mhl' ? captureMhlMatch : captureMatchRequest)(request, response);
}
