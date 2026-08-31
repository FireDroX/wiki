import { ResponseDto } from '../../common/dto/response.dto.js';
import { PageResponseDto } from '../dto/out/page-response.dto.js';
import { PageVersion } from '../entities/page-version.entity.js';
import { Page } from '../entities/page.entity.js';

export class PageMapper {
  static toPageResponseDto(page: Page, version: PageVersion): PageResponseDto {
    return {
      id: page.id,
      slug: page.slug,
      title: page.title,
      parentId: page.parentId,
      visibility: page.visibility,
      isPublished: page.isPublished,
      currentVersion: {
        id: version.id,
        content: version.content,
      },
      createdAt: page.createdAt,
    };
  }

  static toResponse(
    page: Page,
    version: PageVersion,
  ): ResponseDto<PageResponseDto> {
    return new ResponseDto(PageMapper.toPageResponseDto(page, version));
  }
}
