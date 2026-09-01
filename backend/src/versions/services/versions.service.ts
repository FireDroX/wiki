import { Inject, Injectable } from '@nestjs/common';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto.js';
import { ValidationException } from '../../common/exceptions/validation.exception.js';
import {
  CHANGE_SUMMARY_MAX_LENGTH,
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  MAX_LIMIT,
  TITLE_MAX_LENGTH,
} from '../../common/variables.global.js';
import { PageVersion } from '../../pages/entities/page-version.entity.js';
import { ListVersionsQueryDto } from '../dto/in/list-versions-query.dto.js';
import type { VersionsRepository } from '../persistence/version.repository.js';

@Injectable()
export class VersionsService {
  constructor(
    @Inject('VersionsRepository')
    private readonly versionsRepository: VersionsRepository,
  ) {}

  async findAllByPage(
    pageId: string,
    query: ListVersionsQueryDto,
  ): Promise<PaginatedResponseDto<PageVersion>> {
    const page = VersionsService.parsePage(query.page);
    const limit = VersionsService.parseLimit(query.limit);
    const { items, total } = await this.versionsRepository.findAllByPageId(
      pageId,
      page,
      limit,
    );
    return { items, total, page, limit };
  }

  createVersion(
    pageId: string,
    content: string,
    title: string,
    authorId: string,
    changeSummary?: string | null,
  ): Promise<PageVersion> {
    this.validate(title, content, changeSummary);

    return this.versionsRepository.create({
      pageId,
      content,
      title,
      authorId,
      changeSummary: changeSummary ?? null,
    });
  }

  private validate(
    title: string,
    content: string,
    changeSummary?: string | null,
  ): void {
    const errors: string[] = [];

    if (!title || title.length > TITLE_MAX_LENGTH) {
      errors.push(
        `title must be longer than or equal to 1 and shorter than or equal to ${TITLE_MAX_LENGTH} characters`,
      );
    }

    if (typeof content !== 'string') {
      errors.push('content must be a string');
    }

    if (
      changeSummary != null &&
      changeSummary.length > CHANGE_SUMMARY_MAX_LENGTH
    ) {
      errors.push(
        `changeSummary must be shorter than or equal to ${CHANGE_SUMMARY_MAX_LENGTH} characters`,
      );
    }

    if (errors.length > 0) {
      throw new ValidationException(errors.join(', '));
    }
  }

  private static parsePage(raw?: string): number {
    const parsed = Number(raw);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : DEFAULT_PAGE;
  }

  private static parseLimit(raw?: string): number {
    const parsed = Number(raw);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      return DEFAULT_LIMIT;
    }
    return Math.min(parsed, MAX_LIMIT);
  }
}
