import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto.js';
import { ResponseDto } from '../../common/dto/response.dto.js';
import { PageVersion } from '../../pages/entities/page-version.entity.js';
import { VersionSummaryResponseDto } from '../dto/out/version-summary-response.dto.js';

export class VersionMapper {
  static toSummaryDto(version: PageVersion): VersionSummaryResponseDto {
    return {
      id: version.id,
      authorId: version.authorId,
      changeSummary: version.changeSummary,
      createdAt: version.createdAt,
    };
  }

  static toPaginatedResponse(
    items: PageVersion[],
    total: number,
    page: number,
    limit: number,
  ): ResponseDto<PaginatedResponseDto<VersionSummaryResponseDto>> {
    return new ResponseDto({
      items: items.map((item) => VersionMapper.toSummaryDto(item)),
      total,
      page,
      limit,
    });
  }
}
