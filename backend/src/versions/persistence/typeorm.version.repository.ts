import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PageVersion } from '../../pages/entities/page-version.entity.js';
import {
  CreateVersionInput,
  FindAllByPageResult,
  VersionsRepository,
} from './version.repository.js';

@Injectable()
export class TypeormVersionsRepository implements VersionsRepository {
  constructor(
    @InjectRepository(PageVersion)
    private readonly repository: Repository<PageVersion>,
  ) {}

  async create(input: CreateVersionInput): Promise<PageVersion> {
    const version = this.repository.create(input);
    return this.repository.save(version);
  }

  async findAllByPageId(
    pageId: string,
    page: number,
    limit: number,
  ): Promise<FindAllByPageResult> {
    const [items, total] = await this.repository.findAndCount({
      where: { pageId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total };
  }
}
