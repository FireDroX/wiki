import { Module } from '@nestjs/common';
import { TypeormSearchRepository } from './persistence/typeorm.search.repository.js';
import { SearchController } from './search.controller.js';
import { SearchService } from './services/search.service.js';

@Module({
  controllers: [SearchController],
  providers: [
    { provide: 'SearchRepository', useClass: TypeormSearchRepository },
    SearchService,
  ],
  exports: [SearchService],
})
export class SearchModule {}
