export function describeCaptureError(error) {
  if (/SOURCE_BLOCKED|403|огранич|Forbidden/i.test(error.message)) {
    return { kind: 'error', code: 'SOURCE_BLOCKED', message: 'КХЛ временно ограничил доступ серверному браузеру. Повторите запрос позже. Последний снимок сохранён.' };
  }
  if (/Timeout|timed out/i.test(error.message)) {
    return { kind: 'error', code: 'CAPTURE_TIMEOUT', message: 'КХЛ не ответил вовремя. Повторите запрос. Последний снимок сохранён.' };
  }
  return { kind: 'error', code: 'CAPTURE_FAILED', message: 'Браузер не смог загрузить сайт КХЛ. Повторите запрос. Последний снимок не изменён.' };
}
