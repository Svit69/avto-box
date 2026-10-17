import { normalizeResourceUrl } from '../shared/normalizeResourceUrl.js';

export class ResourceResolver {
  #resources;
  #origin;
  #sourceOrigin;
  constructor(resources, origin, sourceOrigin = 'https://www.khl.ru') {
    this.#resources = resources;
    this.#origin = origin;
    this.#sourceOrigin = sourceOrigin;
  }
  resolveResource(requestUrl) {
    const url = new URL(requestUrl);
    const sourceUrl = url.origin === this.#origin
      ? `${this.#sourceOrigin}${url.pathname}${url.search}` : url.href;
    return this.#resources[normalizeResourceUrl(sourceUrl)];
  }
}
