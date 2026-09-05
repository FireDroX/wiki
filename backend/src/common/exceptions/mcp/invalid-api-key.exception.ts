export class InvalidApiKeyException extends Error {
  constructor() {
    super('Invalid or revoked API key');
    this.name = 'InvalidApiKeyException';
  }
}
