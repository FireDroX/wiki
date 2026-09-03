import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VersionsModule } from '../versions/versions.module.js';
import { PagePermission } from './entities/page-permission.entity.js';
import { PageVersion } from './entities/page-version.entity.js';
import { Page } from './entities/page.entity.js';
import { PagesController } from './pages.controller.js';
import { TypeormPagePermissionsRepository } from './persistence/typeorm.page-permission.repository.js';
import { TypeormPagesRepository } from './persistence/typeorm.page.repository.js';
import { PagesService } from './services/pages.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Page, PageVersion, PagePermission]),
    VersionsModule,
  ],
  controllers: [PagesController],
  providers: [
    { provide: 'PagesRepository', useClass: TypeormPagesRepository },
    {
      provide: 'PagePermissionsRepository',
      useClass: TypeormPagePermissionsRepository,
    },
    PagesService,
  ],
  exports: [PagesService],
})
export class PagesModule {}
