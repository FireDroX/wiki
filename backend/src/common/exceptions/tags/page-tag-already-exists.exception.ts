export class PageTagAlreadyExistsException extends Error {
  constructor() {
    super('Tag already associated with this page');
    this.name = 'PageTagAlreadyExistsException';
  }
}
