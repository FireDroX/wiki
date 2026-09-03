import { PagePermission } from '../entities/page-permission.entity.js';

export interface CreatePagePermissionInput {
  pageId: string;
  userId: string;
  grantedById: string;
}

export interface PagePermissionsRepository {
  findByPageAndUser(
    pageId: string,
    userId: string,
  ): Promise<PagePermission | null>;
  findByPage(pageId: string): Promise<PagePermission[]>;
  create(input: CreatePagePermissionInput): Promise<PagePermission>;
  delete(pageId: string, userId: string): Promise<void>;
}
