import { Inject, Injectable } from '@nestjs/common';
import { UsersService } from '../../users/services/users.service.js';
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
