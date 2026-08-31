export class PageHasChildrenException extends Error {
  constructor() {
    super('Page has children, pass cascade=true to delete them');
    this.name = 'PageHasChildrenException';
  }
}
