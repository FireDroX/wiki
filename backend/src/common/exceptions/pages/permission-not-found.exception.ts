export class PermissionNotFoundException extends Error {
  constructor() {
    super('No explicit permission found for this user on this page');
    this.name = 'PermissionNotFoundException';
  }
}
