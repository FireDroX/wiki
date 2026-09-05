import { ResponseDto } from '../../common/dto/response.dto.js';
import {
  AuditLogItemDto,
  AuditLogListDto,
} from '../dto/out/audit-log-response.dto.js';
import { McpAuditLogRow } from '../persistence/mcp-audit-log.repository.js';

export class AuditLogMapper {
  static toListResponse(
    items: McpAuditLogRow[],
    total: number,
  ): ResponseDto<AuditLogListDto> {
    return new ResponseDto({
      items: items.map((item) => AuditLogMapper.toItem(item)),
      total,
    });
  }

  private static toItem(row: McpAuditLogRow): AuditLogItemDto {
    return {
      id: row.id,
      apiKeyName: row.apiKeyName,
      toolName: row.toolName,
      success: row.success,
      input: row.input,
      output: row.output,
      errorMessage: row.errorMessage,
      createdAt: row.createdAt,
    };
  }
}
