export class TagAlreadyExistsException extends Error {
  constructor() {
    super('Tag already exists');
    this.name = 'TagAlreadyExistsException';
  }
}
