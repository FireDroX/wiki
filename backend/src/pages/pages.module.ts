import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PageVersion } from './entities/page-version.entity.js';
import { Page } from './entities/page.entity.js';
import { PagesController } from './pages.controller.js';
import { TypeormPagesRepository } from './persistence/typeorm.page.repository.js';
import { PagesService } from './services/pages.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Page, PageVersion])],
  controllers: [PagesController],
  providers: [
    { provide: 'PagesRepository', useClass: TypeormPagesRepository },
    PagesService,
  ],
  exports: [PagesService],
})
export class PagesModule {}
