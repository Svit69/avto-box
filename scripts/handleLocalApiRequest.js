import captureMatchRequest from '../api/capture.js';

export async function handleLocalApiRequest(request, response) {
  response.status = code => { response.statusCode = code; return response; };
  response.json = value => {
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.end(JSON.stringify(value));
  };
  await captureMatchRequest(request, response);
}
