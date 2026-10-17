import { normalizeResourceUrl } from '../shared/normalizeResourceUrl.js';

export function getResponseResourceUrls(response) {
  const urls = new Set([normalizeResourceUrl(response.url())]);
  let previous = response.request().redirectedFrom();
  while (previous) {
    urls.add(normalizeResourceUrl(previous.url()));
    previous = previous.redirectedFrom();
  }
  return [...urls];
}
