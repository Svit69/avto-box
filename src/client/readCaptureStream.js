export async function readCaptureStream(response, onEvent) {
  if (!response.ok) throw new Error(`Сервис снимков вернул ошибку ${response.status}.`);
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let pending = '';
  try {
    while (true) {
      const { value, done } = await reader.read();
      pending += decoder.decode(value, { stream: !done });
      let newline;
      while ((newline = pending.indexOf('\n')) >= 0) {
        const line = pending.slice(0, newline);
        pending = pending.slice(newline + 1);
        if (line.trim()) onEvent(JSON.parse(line));
      }
      if (done) break;
    }
    if (pending.trim()) onEvent(JSON.parse(pending));
  } finally { reader.releaseLock(); }
}
