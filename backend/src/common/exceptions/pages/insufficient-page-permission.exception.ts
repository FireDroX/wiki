export class InsufficientPagePermissionException extends Error {
  constructor() {
    super('Insufficient permission to edit this page');
    this.name = 'InsufficientPagePermissionException';
  }
}
