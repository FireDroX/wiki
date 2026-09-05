import { ResponseDto } from '../../common/dto/response.dto.js';
import { PageTag } from '../entities/page-tag.entity.js';
import { Tag } from '../entities/tag.entity.js';
import { PageTagResponseDto } from '../dto/out/page-tag-response.dto.js';
import { TagResponseDto, TagSummaryDto } from '../dto/out/tag-response.dto.js';

export class TagMapper {
  static toResponse(entity: Tag): ResponseDto<TagResponseDto> {
    return new ResponseDto({
      id: entity.id,
      name: entity.name,
      color: entity.color,
      createdAt: entity.createdAt,
    });
  }

  static toListResponse(entities: Tag[]): ResponseDto<TagSummaryDto[]> {
    return new ResponseDto(
      entities.map((entity) => ({
        id: entity.id,
        name: entity.name,
        color: entity.color,
      })),
    );
  }

  static toPageTagResponse(entity: PageTag): ResponseDto<PageTagResponseDto> {
    return new ResponseDto({ pageId: entity.pageId, tagId: entity.tagId });
  }
}
