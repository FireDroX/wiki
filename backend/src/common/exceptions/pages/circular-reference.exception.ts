export class CircularReferenceException extends Error {
  constructor() {
    super('Cannot move a page under one of its own descendants');
    this.name = 'CircularReferenceException';
  }
}
