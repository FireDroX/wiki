export class SlugAlreadyExistsException extends Error {
  constructor() {
    super('Slug already exists under this parent');
    this.name = 'SlugAlreadyExistsException';
  }
}
