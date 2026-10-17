export function normalizeResourceUrl(input) {
  const url = new URL(input, 'https://www.khl.ru');
  if (/(^|\.)khl\.ru$/.test(url.hostname)) {
    url.protocol = 'https:';
    url.pathname = url.pathname.replace(/\/{2,}/g, '/');
  }
  url.hash = '';
  for (const parameter of ['_', 'timestamp', 'ts', 'rnd', 'cachebuster', 'utm_referrer']) {
    url.searchParams.delete(parameter);
  }
  url.searchParams.sort();
  return url.href;
}
