import { Inject, Injectable } from '@nestjs/common';
import type { AuthenticatedUser } from '../../common/strategies/jwt.strategy.js';
import { ParentPageNotFoundException } from '../../common/exceptions/pages/parent-page-not-found.exception.js';
import { SlugAlreadyExistsException } from '../../common/exceptions/pages/slug-already-exists.exception.js';
import { ValidationException } from '../../common/exceptions/validation.exception.js';
import {
  SLUG_MAX_LENGTH,
  SLUG_REGEX,
  TITLE_MAX_LENGTH,
} from '../../common/variables.global.js';
import { CreatePageDto } from '../dto/in/create-page.dto.js';
import { PageTreeNodeDto } from '../dto/out/page-tree-node.dto.js';
import { PageVersion } from '../entities/page-version.entity.js';
import { Page, PAGE_VISIBILITIES } from '../entities/page.entity.js';
import { PageTreeMapper } from '../mapper/page-tree.mapper.js';
import type { PagesRepository } from '../persistence/page.repository.js';

@Injectable()
export class PagesService {
  constructor(
    @Inject('PagesRepository')
    private readonly pagesRepository: PagesRepository,
  ) {}

  async createPage(
    dto: CreatePageDto,
    createdById: string,
  ): Promise<{ page: Page; version: PageVersion }> {
    this.validateCreatePage(dto);

    const parentId = dto.parentId ?? null;
    if (parentId !== null) {
      const parent = await this.pagesRepository.findById(parentId);
      if (!parent) {
        throw new ParentPageNotFoundException();
      }
    }

    const existing = await this.pagesRepository.findBySlugAndParent(
      dto.slug,
      parentId,
    );
    if (existing) {
      throw new SlugAlreadyExistsException();
    }

    return this.pagesRepository.createWithFirstVersion({
      slug: dto.slug,
      title: dto.title,
      content: dto.content,
      parentId,
      visibility: dto.visibility,
      createdById,
    });
  }

  async getTree(currentUser?: AuthenticatedUser): Promise<PageTreeNodeDto[]> {
    const pages = await this.pagesRepository.findAll();
    const canSeeAll =
      currentUser?.role === 'admin' || currentUser?.role === 'editor';
    const visible = canSeeAll
      ? pages
      : pages.filter(
          (page) => page.visibility === 'public' && page.isPublished,
        );

    return PageTreeMapper.buildTree(visible);
  }

  private validateCreatePage(dto: CreatePageDto): void {
    const errors: string[] = [];

    if (!dto.slug || dto.slug.length > SLUG_MAX_LENGTH) {
      errors.push(
        `slug must be longer than or equal to 1 and shorter than or equal to ${SLUG_MAX_LENGTH} characters`,
      );
    } else if (!SLUG_REGEX.test(dto.slug)) {
      errors.push(`slug must match ${SLUG_REGEX}`);
    }

    if (!dto.title || dto.title.length > TITLE_MAX_LENGTH) {
      errors.push(
        `title must be longer than or equal to 1 and shorter than or equal to ${TITLE_MAX_LENGTH} characters`,
      );
    }

    if (typeof dto.content !== 'string') {
      errors.push('content must be a string');
    }

    if (!PAGE_VISIBILITIES.includes(dto.visibility)) {
      errors.push(
        `visibility must be one of the following values: ${PAGE_VISIBILITIES.join(', ')}`,
      );
    }

    if (errors.length > 0) {
      throw new ValidationException(errors.join(', '));
    }
  }
}
