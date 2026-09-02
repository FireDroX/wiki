export class StorageDeleteFailedException extends Error {
  constructor() {
    super('Failed to delete file from storage');
    this.name = 'StorageDeleteFailedException';
  }
}
