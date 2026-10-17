export class MatchSelection {
  #id;
  #league;
  constructor(id = '902144', league = 'khl') {
    if (!/^[1-9]\d{0,9}$/.test(String(id))) throw new Error('ID матча должен быть положительным целым числом.');
    this.#id = String(id);
    if (!['khl', 'mhl'].includes(league)) throw new Error('Неизвестная лига.');
    this.#league = league;
  }
  static fromUrl(input) {
    const url = new URL(input, 'https://avto-box.vercel.app');
    const fragmentId = url.hash.match(/(?:[?&]id=|[+/])(\d+)(?:&|$)/)?.[1];
    const league = url.pathname === '/mhl.html' ? 'mhl' : 'khl';
    return new MatchSelection(url.searchParams.get('id') ?? fragmentId ?? (league === 'mhl' ? '903207' : '902144'), league);
  }
  static isMatchPage(input) { return ['/mirror.html', '/khl.html', '/mhl.html'].includes(new URL(input, 'https://avto-box.vercel.app').pathname); }
  get id() { return this.#id; }
  get league() { return this.#league; }
  get key() { return `${this.#league}:${this.#id}`; }
  get label() { return this.#league === 'mhl' ? 'МХЛ' : 'КХЛ'; }
  get sourceUrl() { return this.#league === 'mhl' ? `https://text.mhl.khl.ru/${this.#id}.html` : `https://www.khl.ru/game/1436/${this.#id}/text/#stats`; }
  get mirrorUrl() { return `/${this.#league}.html?id=${this.#id}#stats`; }
  get captureUrl() { return `/api/${this.#league}?id=${this.#id}`; }
}
