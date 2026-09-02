import { MAX_ATTACHMENT_SIZE_MB } from '../../variables.global.js';

export class FileTooLargeException extends Error {
  constructor() {
    super(`File exceeds maximum size of ${MAX_ATTACHMENT_SIZE_MB}MB`);
    this.name = 'FileTooLargeException';
  }
}
