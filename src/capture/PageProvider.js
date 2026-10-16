export class PageProvider {
  async capturePage() {
    throw new Error('Поставщик страницы должен реализовать capturePage().');
  }
}
