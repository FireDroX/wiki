import { ResponseDto } from '../../common/dto/response.dto.js';
import { PagePermissionResponseDto } from '../dto/out/page-permission-response.dto.js';
import { PagePermission } from '../entities/page-permission.entity.js';

export class PagePermissionMapper {
  static toPagePermissionResponseDto(
    permission: PagePermission,
  ): PagePermissionResponseDto {
    return {
      id: permission.id,
      pageId: permission.pageId,
      userId: permission.userId,
      grantedById: permission.grantedById,
      createdAt: permission.createdAt,
    };
  }

  static toResponse(
    permission: PagePermission,
  ): ResponseDto<PagePermissionResponseDto> {
    return new ResponseDto(
      PagePermissionMapper.toPagePermissionResponseDto(permission),
    );
  }

  static toListResponse(
    permissions: PagePermission[],
  ): ResponseDto<PagePermissionResponseDto[]> {
    return new ResponseDto(
      permissions.map((permission) =>
        PagePermissionMapper.toPagePermissionResponseDto(permission),
      ),
    );
  }
}
