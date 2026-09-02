import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageModule } from '../storage/storage.module.js';
import { Attachment } from './entities/attachment.entity.js';
import { MediaController } from './media.controller.js';
import { TypeormAttachmentsRepository } from './persistence/typeorm.attachment.repository.js';
import { MediaService } from './services/media.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Attachment]), StorageModule],
  controllers: [MediaController],
  providers: [
    {
      provide: 'AttachmentsRepository',
      useClass: TypeormAttachmentsRepository,
    },
    MediaService,
  ],
  exports: [MediaService],
})
export class MediaModule {}
