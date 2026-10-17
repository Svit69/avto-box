export function createArchiveErrorResponse(message, status = 404) {
  const escaped = message.replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
  return new Response(`<!doctype html><html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Матч недоступен</title><body><main><h1>Матч недоступен</h1><p>${escaped}</p><p>Откройте ссылку матча заново, чтобы создать свежий снимок.</p><a href="/">Открыть основной матч</a></main></body></html>`, {
    status, headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
