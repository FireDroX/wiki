export class PageAccessForbiddenException extends Error {
  constructor() {
    super('You do not have access to this page');
    this.name = 'PageAccessForbiddenException';
  }
}
