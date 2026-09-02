export class UnsupportedFileTypeException extends Error {
  constructor() {
    super('Unsupported file type');
    this.name = 'UnsupportedFileTypeException';
  }
}
