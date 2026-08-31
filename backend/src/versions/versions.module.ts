import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PageVersion } from '../pages/entities/page-version.entity.js';
import { TypeormVersionsRepository } from './persistence/typeorm.version.repository.js';
import { VersionsService } from './services/versions.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([PageVersion])],
  providers: [
    { provide: 'VersionsRepository', useClass: TypeormVersionsRepository },
    VersionsService,
  ],
  exports: [VersionsService],
})
export class VersionsModule {}
