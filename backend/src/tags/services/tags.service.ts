import { Inject, Injectable } from '@nestjs/common';
import { PageTagAlreadyExistsException } from '../../common/exceptions/tags/page-tag-already-exists.exception.js';
import { PageTagNotFoundException } from '../../common/exceptions/tags/page-tag-not-found.exception.js';
import { TagAlreadyExistsException } from '../../common/exceptions/tags/tag-already-exists.exception.js';
import { TagNotFoundException } from '../../common/exceptions/tags/tag-not-found.exception.js';
import { ValidationException } from '../../common/exceptions/validation.exception.js';
import {
  DEFAULT_TAG_COLOR,
  TAG_COLOR_REGEX,
  TAG_NAME_MAX_LENGTH,
} from '../../common/variables.global.js';
import { PagesService } from '../../pages/services/pages.service.js';
import { CreateTagDto } from '../dto/in/create-tag.dto.js';
import { PageTag } from '../entities/page-tag.entity.js';
import { Tag } from '../entities/tag.entity.js';
import type { TagRepository } from '../persistence/tag.repository.js';

@Injectable()
export class TagsService {
  constructor(
    @Inject('TagsRepository') private readonly tagRepository: TagRepository,
    private readonly pagesService: PagesService,
  ) {}

  async createTag(dto: CreateTagDto): Promise<Tag> {
    this.validateName(dto.name);
    const color = this.validateColor(dto.color);

    const existing = await this.tagRepository.findByName(dto.name);
    if (existing) {
      throw new TagAlreadyExistsException();
    }

    return this.tagRepository.create(dto.name, color);
  }

  listTags(): Promise<Tag[]> {
    return this.tagRepository.findAll();
  }

  async deleteTag(id: string): Promise<void> {
    const tag = await this.tagRepository.findById(id);
    if (!tag) {
      throw new TagNotFoundException();
    }
    await this.tagRepository.delete(id);
  }

  async tagPage(pageId: string, tagId: string): Promise<PageTag> {
    await this.pagesService.getByIdOrFail(pageId);

    const tag = await this.tagRepository.findById(tagId);
    if (!tag) {
      throw new TagNotFoundException();
    }

    const existing = await this.tagRepository.findPageTag(pageId, tagId);
    if (existing) {
      throw new PageTagAlreadyExistsException();
    }

    return this.tagRepository.createPageTag(pageId, tagId);
  }

  async untagPage(pageId: string, tagId: string): Promise<void> {
    const existing = await this.tagRepository.findPageTag(pageId, tagId);
    if (!existing) {
      throw new PageTagNotFoundException();
    }
    await this.tagRepository.deletePageTag(pageId, tagId);
  }

  private validateName(name: string): void {
    if (!name || name.length > TAG_NAME_MAX_LENGTH) {
      throw new ValidationException(
        `name must be longer than or equal to 1 and shorter than or equal to ${TAG_NAME_MAX_LENGTH} characters`,
      );
    }
  }

  private validateColor(color?: string): string {
    if (color === undefined) {
      return DEFAULT_TAG_COLOR;
    }
    if (!TAG_COLOR_REGEX.test(color)) {
      throw new ValidationException('color must be a hex color (ex. #3b82f6)');
    }
    return color;
  }
}
