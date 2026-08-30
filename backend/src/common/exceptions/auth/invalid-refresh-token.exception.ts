export class InvalidRefreshTokenException extends Error {
  constructor() {
    super('Invalid or expired refresh token');
    this.name = 'InvalidRefreshTokenException';
  }
}
