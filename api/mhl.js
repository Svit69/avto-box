import { handleCaptureRequest } from '../src/capture/handleCaptureRequest.js';

export default function captureMhlMatch(request, response) {
  return handleCaptureRequest(request, response, 'mhl');
}
