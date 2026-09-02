import { Attachment } from '../entities/attachment.entity.js';

export interface CreateAttachmentInput {
  pageId: string | null;
  minioKey: string;
  filename: string;
  mimeType: string;
  size: number;
  uploadedById: string;
}

export interface AttachmentsRepository {
  create(input: CreateAttachmentInput): Promise<Attachment>;
  findAllByPageId(pageId: string): Promise<Attachment[]>;
}
