export class MatchPreferences {
  #storage;
  constructor(storage = localStorage) { this.#storage = storage; }
  initializePreferences() {
    if (typeof KHL === 'undefined') return;
    KHL.SetHideScore = value => this.saveScoreVisibility(value);
    if (this.#storage.getItem('archive.hideScore') === '1') {
      const button = document.querySelector('.hide-score-button');
      if (button?.textContent.includes('Скрыть')) button.click();
    }
  }
  saveScoreVisibility(value) {
    this.#storage.setItem('archive.hideScore', String(value));
  }
}
