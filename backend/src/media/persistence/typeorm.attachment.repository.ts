import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attachment } from '../entities/attachment.entity.js';
import {
  AttachmentsRepository,
  CreateAttachmentInput,
} from './attachment.repository.js';

@Injectable()
export class TypeormAttachmentsRepository implements AttachmentsRepository {
  constructor(
    @InjectRepository(Attachment)
    private readonly repository: Repository<Attachment>,
  ) {}

  create(input: CreateAttachmentInput): Promise<Attachment> {
    return this.repository.save(this.repository.create(input));
  }

  findAllByPageId(pageId: string): Promise<Attachment[]> {
    return this.repository.find({
      where: { pageId },
      order: { createdAt: 'DESC' },
    });
  }
}
