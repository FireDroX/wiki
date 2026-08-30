export class EmailAlreadyExistsException extends Error {
  constructor() {
    super('Email already in use');
    this.name = 'EmailAlreadyExistsException';
  }
}
