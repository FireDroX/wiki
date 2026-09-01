export class VersionNotFoundException extends Error {
  constructor() {
    super('Version not found');
    this.name = 'VersionNotFoundException';
  }
}
