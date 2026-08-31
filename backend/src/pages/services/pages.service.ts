import { Inject, Injectable } from '@nestjs/common';
import type { AuthenticatedUser } from '../../common/strategies/jwt.strategy.js';
import { CircularReferenceException } from '../../common/exceptions/pages/circular-reference.exception.js';
import { PageAccessForbiddenException } from '../../common/exceptions/pages/page-access-forbidden.exception.js';
import { PageNotFoundException } from '../../common/exceptions/pages/page-not-found.exception.js';
import { ParentPageNotFoundException } from '../../common/exceptions/pages/parent-page-not-found.exception.js';
import { SlugAlreadyExistsException } from '../../common/exceptions/pages/slug-already-exists.exception.js';
import { ValidationException } from '../../common/exceptions/validation.exception.js';
import {
  CHANGE_SUMMARY_MAX_LENGTH,
  SLUG_MAX_LENGTH,
  SLUG_REGEX,
  TITLE_MAX_LENGTH,
  UUID_REGEX,
} from '../../common/variables.global.js';
import { CreatePageDto } from '../dto/in/create-page.dto.js';
import { MovePageDto } from '../dto/in/move-page.dto.js';
import { UpdatePageDto } from '../dto/in/update-page.dto.js';
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
    const visible = PagesService.hasFullAccess(currentUser)
      ? pages
      : pages.filter(
          (page) => page.visibility === 'public' && page.isPublished,
        );

    return PageTreeMapper.buildTree(visible);
  }

  async findByPath(
    segments: string[],
    currentUser?: AuthenticatedUser,
  ): Promise<{ page: Page; version: PageVersion }> {
    if (segments.length === 0) {
      throw new PageNotFoundException();
    }

    let parentId: string | null = null;
    let page: Page | null = null;
    for (const slug of segments) {
      page = await this.pagesRepository.findBySlugAndParent(slug, parentId);
      if (!page) {
        throw new PageNotFoundException();
      }
      parentId = page.id;
    }

    if (!page || !page.currentVersionId) {
      throw new PageNotFoundException();
    }

    const isPubliclyAccessible =
      page.visibility === 'public' && page.isPublished;
    if (!isPubliclyAccessible && !PagesService.hasFullAccess(currentUser)) {
      throw new PageAccessForbiddenException();
    }

    const version = await this.pagesRepository.findVersionById(
      page.currentVersionId,
    );
    if (!version) {
      throw new PageNotFoundException();
    }

    return { page, version };
  }

  async updatePage(
    id: string,
    dto: UpdatePageDto,
    authorId: string,
  ): Promise<{ page: Page; version: PageVersion }> {
    const page = await this.pagesRepository.findById(id);
    if (!page || !page.currentVersionId) {
      throw new PageNotFoundException();
    }

    const currentVersion = await this.pagesRepository.findVersionById(
      page.currentVersionId,
    );
    if (!currentVersion) {
      throw new PageNotFoundException();
    }

    this.validateUpdatePage(dto);

    const title = dto.title ?? page.title;
    const content = dto.content ?? currentVersion.content;

    return this.pagesRepository.updateWithNewVersion({
      page,
      title,
      content,
      changeSummary: dto.changeSummary ?? null,
      authorId,
    });
  }

  async movePage(
    id: string,
    dto: MovePageDto,
  ): Promise<{ page: Page; version: PageVersion }> {
    this.validateMovePage(dto);

    const page = await this.pagesRepository.findById(id);
    if (!page || !page.currentVersionId) {
      throw new PageNotFoundException();
    }

    const currentVersion = await this.pagesRepository.findVersionById(
      page.currentVersionId,
    );
    if (!currentVersion) {
      throw new PageNotFoundException();
    }

    const newParentId = dto.newParentId;
    if (newParentId !== null) {
      let currentId: string | null = newParentId;
      while (currentId !== null) {
        if (currentId === id) {
          throw new CircularReferenceException();
        }
        const ancestor: Page | null =
          await this.pagesRepository.findById(currentId);
        if (!ancestor) {
          throw new ParentPageNotFoundException();
        }
        currentId = ancestor.parentId;
      }
    }

    const existing = await this.pagesRepository.findBySlugAndParent(
      page.slug,
      newParentId,
    );
    if (existing && existing.id !== page.id) {
      throw new SlugAlreadyExistsException();
    }

    const moved = await this.pagesRepository.updateParent(page, newParentId);

    return { page: moved, version: currentVersion };
  }

  private static hasFullAccess(currentUser?: AuthenticatedUser): boolean {
    return currentUser?.role === 'admin' || currentUser?.role === 'editor';
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

  private validateMovePage(dto: MovePageDto): void {
    if (
      dto.newParentId !== null &&
      (typeof dto.newParentId !== 'string' || !UUID_REGEX.test(dto.newParentId))
    ) {
      throw new ValidationException('newParentId must be a UUID');
    }
  }

  private validateUpdatePage(dto: UpdatePageDto): void {
    const errors: string[] = [];

    if (
      dto.title !== undefined &&
      (!dto.title || dto.title.length > TITLE_MAX_LENGTH)
    ) {
      errors.push(
        `title must be longer than or equal to 1 and shorter than or equal to ${TITLE_MAX_LENGTH} characters`,
      );
    }

    if (dto.content !== undefined && typeof dto.content !== 'string') {
      errors.push('content must be a string');
    }

    if (
      dto.changeSummary !== undefined &&
      (typeof dto.changeSummary !== 'string' ||
        dto.changeSummary.length > CHANGE_SUMMARY_MAX_LENGTH)
    ) {
      errors.push(
        `changeSummary must be shorter than or equal to ${CHANGE_SUMMARY_MAX_LENGTH} characters`,
      );
    }

    if (errors.length > 0) {
      throw new ValidationException(errors.join(', '));
    }
  }
}
