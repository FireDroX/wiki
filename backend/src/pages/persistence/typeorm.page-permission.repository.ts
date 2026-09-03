import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PagePermission } from '../entities/page-permission.entity.js';
import {
  CreatePagePermissionInput,
  PagePermissionsRepository,
} from './page-permission.repository.js';

@Injectable()
export class TypeormPagePermissionsRepository implements PagePermissionsRepository {
  constructor(
    @InjectRepository(PagePermission)
    private readonly repository: Repository<PagePermission>,
  ) {}

  findByPageAndUser(
    pageId: string,
    userId: string,
  ): Promise<PagePermission | null> {
    return this.repository.findOneBy({ pageId, userId });
  }

  findByPage(pageId: string): Promise<PagePermission[]> {
    return this.repository.find({
      where: { pageId },
      order: { createdAt: 'ASC' },
    });
  }

  create(input: CreatePagePermissionInput): Promise<PagePermission> {
    return this.repository.save(this.repository.create(input));
  }

  async delete(pageId: string, userId: string): Promise<void> {
    await this.repository.delete({ pageId, userId });
  }
}
