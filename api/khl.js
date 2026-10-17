import { handleCaptureRequest } from '../src/capture/handleCaptureRequest.js';

export default function captureKhlMatch(request, response) {
  return handleCaptureRequest(request, response, 'khl');
}
