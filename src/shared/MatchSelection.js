export class MatchSelection {
  #id;
  constructor(id = '902144') {
    if (!/^[1-9]\d{0,9}$/.test(String(id))) throw new Error('ID матча должен быть положительным целым числом.');
    this.#id = String(id);
  }
  static fromUrl(input) {
    const url = new URL(input, 'https://avto-box.vercel.app');
    const fragmentId = url.hash.match(/(?:[?&]id=|[+/])(\d+)(?:&|$)/)?.[1];
    return new MatchSelection(url.searchParams.get('id') ?? fragmentId ?? '902144');
  }
  get id() { return this.#id; }
  get sourceUrl() { return `https://www.khl.ru/game/1436/${this.#id}/text/#stats`; }
  get mirrorUrl() { return `/mirror.html?id=${this.#id}#stats`; }
}
