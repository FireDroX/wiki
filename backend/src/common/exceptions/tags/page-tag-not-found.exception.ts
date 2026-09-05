export class PageTagNotFoundException extends Error {
  constructor() {
    super('Tag association not found');
    this.name = 'PageTagNotFoundException';
  }
}
