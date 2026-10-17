export function describeCaptureError(error, leagueLabel = 'КХЛ') {
  if (/SOURCE_BLOCKED|403|огранич|Forbidden/i.test(error.message)) {
    return { kind: 'error', code: 'SOURCE_BLOCKED', message: `${leagueLabel} временно ограничил доступ серверному браузеру. Повторите запрос позже. Последний снимок сохранён.` };
  }
  if (/Timeout|timed out/i.test(error.message)) {
    return { kind: 'error', code: 'CAPTURE_TIMEOUT', message: `${leagueLabel} не ответил вовремя. Повторите запрос. Последний снимок сохранён.` };
  }
  return { kind: 'error', code: 'CAPTURE_FAILED', message: `Браузер не смог загрузить сайт ${leagueLabel}. Повторите запрос. Последний снимок не изменён.` };
}
