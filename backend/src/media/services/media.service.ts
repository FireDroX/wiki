import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { FileTooLargeException } from '../../common/exceptions/media/file-too-large.exception.js';
import { UnsupportedFileTypeException } from '../../common/exceptions/media/unsupported-file-type.exception.js';
import { ValidationException } from '../../common/exceptions/validation.exception.js';
import {
  ALLOWED_ATTACHMENT_MIME_TYPES,
  MAX_ATTACHMENT_SIZE_BYTES,
  MEDIA_PRESIGNED_URL_EXPIRY_SECONDS,
  UUID_REGEX,
} from '../../common/variables.global.js';
import { StorageService } from '../../storage/services/storage.service.js';
import { UploadMediaDto } from '../dto/in/upload-media.dto.js';
import { Attachment } from '../entities/attachment.entity.js';
import type { AttachmentsRepository } from '../persistence/attachment.repository.js';

export interface UploadedMediaFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Injectable()
export class MediaService {
  constructor(
    @Inject('AttachmentsRepository')
    private readonly attachmentsRepository: AttachmentsRepository,
    private readonly storageService: StorageService,
  ) {}

  async uploadFile(
    file: UploadedMediaFile | undefined,
    dto: UploadMediaDto,
    uploadedById: string,
  ): Promise<{ attachment: Attachment; url: string }> {
    if (!file) {
      throw new ValidationException('No file provided');
    }

    this.validateUpload(file, dto);

    const pageId = dto.pageId ?? null;
    const minioKey = `pages/${pageId ?? 'unassigned'}/${randomUUID()}-${file.originalname}`;

    await this.storageService.uploadFile(minioKey, file.buffer, file.mimetype);

    const attachment = await this.attachmentsRepository.create({
      pageId,
      minioKey,
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      uploadedById,
    });

    const url = await this.storageService.getPresignedUrl(
      minioKey,
      MEDIA_PRESIGNED_URL_EXPIRY_SECONDS,
    );

    return { attachment, url };
  }

  private validateUpload(file: UploadedMediaFile, dto: UploadMediaDto): void {
    if (dto.pageId !== undefined && !UUID_REGEX.test(dto.pageId)) {
      throw new ValidationException('pageId must be a UUID');
    }

    if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
      throw new FileTooLargeException();
    }

    if (!ALLOWED_ATTACHMENT_MIME_TYPES.includes(file.mimetype)) {
      throw new UnsupportedFileTypeException();
    }
  }
}
