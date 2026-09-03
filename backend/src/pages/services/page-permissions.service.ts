import { Inject, Injectable } from '@nestjs/common';
import { PageNotFoundException } from '../../common/exceptions/pages/page-not-found.exception.js';
import { PermissionAlreadyExistsException } from '../../common/exceptions/pages/permission-already-exists.exception.js';
import { PermissionNotFoundException } from '../../common/exceptions/pages/permission-not-found.exception.js';
import { UsersService } from '../../users/services/users.service.js';
import { PagePermission } from '../entities/page-permission.entity.js';
import type { PagePermissionsRepository } from '../persistence/page-permission.repository.js';
import type { PagesRepository } from '../persistence/page.repository.js';

@Injectable()
export class PagePermissionsService {
  constructor(
    @Inject('PagePermissionsRepository')
    private readonly pagePermissionsRepository: PagePermissionsRepository,
    @Inject('PagesRepository')
    private readonly pagesRepository: PagesRepository,
    private readonly usersService: UsersService,
  ) {}

  async grant(
    pageId: string,
    userId: string,
    grantedById: string,
  ): Promise<PagePermission> {
    const page = await this.pagesRepository.findById(pageId);
    if (!page) {
      throw new PageNotFoundException();
    }

    await this.usersService.findById(userId);

    const existing = await this.pagePermissionsRepository.findByPageAndUser(
      pageId,
      userId,
    );
    if (existing) {
      throw new PermissionAlreadyExistsException();
    }

    return this.pagePermissionsRepository.create({
      pageId,
      userId,
      grantedById,
    });
  }

  async revoke(pageId: string, userId: string): Promise<void> {
    const existing = await this.pagePermissionsRepository.findByPageAndUser(
      pageId,
      userId,
    );
    if (!existing) {
      throw new PermissionNotFoundException();
    }

    await this.pagePermissionsRepository.delete(pageId, userId);
  }

  async listExplicit(pageId: string): Promise<PagePermission[]> {
    const page = await this.pagesRepository.findById(pageId);
    if (!page) {
      throw new PageNotFoundException();
    }

    return this.pagePermissionsRepository.findByPage(pageId);
  }

  async canEdit(userId: string, pageId: string): Promise<boolean> {
    const user = await this.usersService.findById(userId);
    if (user.role === 'admin' || user.role === 'editor') {
      return true;
    }

    let currentPageId: string | null = pageId;
    while (currentPageId !== null) {
      const grant = await this.pagePermissionsRepository.findByPageAndUser(
        currentPageId,
        userId,
      );
      if (grant) {
        return true;
      }

      const page = await this.pagesRepository.findById(currentPageId);
      if (!page) {
        return false;
      }
      currentPageId = page.parentId;
    }

    return false;
  }
}
