import { normalizeResourceUrl } from '../shared/normalizeResourceUrl.js';

export class ResourceResolver {
  #resources;
  #origin;
  constructor(resources, origin) {
    this.#resources = resources;
    this.#origin = origin;
  }
  resolveResource(requestUrl) {
    const url = new URL(requestUrl);
    const sourceUrl = url.origin === this.#origin
      ? `https://www.khl.ru${url.pathname}${url.search}` : url.href;
    return this.#resources[normalizeResourceUrl(sourceUrl)];
  }
}
