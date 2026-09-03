export class PermissionAlreadyExistsException extends Error {
  constructor() {
    super('Permission already exists for this user on this page');
    this.name = 'PermissionAlreadyExistsException';
  }
}
