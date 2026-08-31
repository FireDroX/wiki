export class PageNotFoundException extends Error {
  constructor() {
    super('Page not found');
    this.name = 'PageNotFoundException';
  }
}
