import { ResponseDto } from '../../common/dto/response.dto.js';
import { McpApiKey } from '../entities/mcp-api-key.entity.js';
import {
  ApiKeyCreatedResponseDto,
  ApiKeySummaryDto,
} from '../dto/out/api-key-response.dto.js';

export class ApiKeyMapper {
  static toCreatedResponse(
    entity: McpApiKey,
    plainKey: string,
  ): ResponseDto<ApiKeyCreatedResponseDto> {
    return new ResponseDto({
      id: entity.id,
      name: entity.name,
      key: plainKey,
      scopes: entity.scopes,
      createdAt: entity.createdAt,
    });
  }

  static toSummary(entity: McpApiKey): ApiKeySummaryDto {
    return {
      id: entity.id,
      name: entity.name,
      scopes: entity.scopes,
      lastUsedAt: entity.lastUsedAt,
      revokedAt: entity.revokedAt,
      createdAt: entity.createdAt,
    };
  }

  static toListResponse(
    entities: McpApiKey[],
  ): ResponseDto<ApiKeySummaryDto[]> {
    return new ResponseDto(
      entities.map((entity) => ApiKeyMapper.toSummary(entity)),
    );
  }
}
