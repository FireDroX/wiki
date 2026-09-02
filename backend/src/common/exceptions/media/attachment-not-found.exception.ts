export class AttachmentNotFoundException extends Error {
  constructor() {
    super('Attachment not found');
    this.name = 'AttachmentNotFoundException';
  }
}
