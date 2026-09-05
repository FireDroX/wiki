import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PageTag } from '../entities/page-tag.entity.js';
import { Tag } from '../entities/tag.entity.js';
import { TagRepository } from './tag.repository.js';

@Injectable()
export class TypeormTagRepository implements TagRepository {
  constructor(
    @InjectRepository(Tag) private readonly repository: Repository<Tag>,
    @InjectRepository(PageTag)
    private readonly pageTagRepository: Repository<PageTag>,
  ) {}

  findAll(): Promise<Tag[]> {
    return this.repository.find({ order: { name: 'ASC' } });
  }

  findById(id: string): Promise<Tag | null> {
    return this.repository.findOneBy({ id });
  }

  findByName(name: string): Promise<Tag | null> {
    return this.repository.findOneBy({ name });
  }

  async create(name: string, color: string): Promise<Tag> {
    return this.repository.save(this.repository.create({ name, color }));
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  findPageTag(pageId: string, tagId: string): Promise<PageTag | null> {
    return this.pageTagRepository.findOneBy({ pageId, tagId });
  }

  async createPageTag(pageId: string, tagId: string): Promise<PageTag> {
    return this.pageTagRepository.save(
      this.pageTagRepository.create({ pageId, tagId }),
    );
  }

  async deletePageTag(pageId: string, tagId: string): Promise<void> {
    await this.pageTagRepository.delete({ pageId, tagId });
  }
}
