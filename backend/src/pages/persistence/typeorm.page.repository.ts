import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
import { PageVersion } from '../entities/page-version.entity.js';
import { Page } from '../entities/page.entity.js';
import {
  CreatePageWithFirstVersionInput,
  PagesRepository,
} from './page.repository.js';

@Injectable()
export class TypeormPagesRepository implements PagesRepository {
  constructor(
    @InjectRepository(Page) private readonly repository: Repository<Page>,
    @InjectRepository(PageVersion)
    private readonly versionRepository: Repository<PageVersion>,
    private readonly dataSource: DataSource,
  ) {}

  findById(id: string): Promise<Page | null> {
    return this.repository.findOneBy({ id });
  }

  findVersionById(id: string): Promise<PageVersion | null> {
    return this.versionRepository.findOneBy({ id });
  }

  findBySlugAndParent(
    slug: string,
    parentId: string | null,
  ): Promise<Page | null> {
    return this.repository.findOneBy({
      slug,
      parentId: parentId === null ? IsNull() : parentId,
    });
  }

  findAll(): Promise<Page[]> {
    return this.repository.find({ order: { createdAt: 'ASC' } });
  }

  async createWithFirstVersion(
    input: CreatePageWithFirstVersionInput,
  ): Promise<{ page: Page; version: PageVersion }> {
    return this.dataSource.transaction(async (manager) => {
      const page = await manager.save(
        manager.create(Page, {
          slug: input.slug,
          title: input.title,
          parentId: input.parentId,
          visibility: input.visibility,
          createdById: input.createdById,
        }),
      );

      const version = await manager.save(
        manager.create(PageVersion, {
          pageId: page.id,
          content: input.content,
          title: input.title,
          authorId: input.createdById,
        }),
      );

      page.currentVersionId = version.id;
      await manager.save(page);

      return { page, version };
    });
  }
}
