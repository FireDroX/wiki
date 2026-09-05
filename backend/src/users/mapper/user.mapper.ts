import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto.js';
import { ResponseDto } from '../../common/dto/response.dto.js';
import { User } from '../entities/user.entity.js';
import { UserResponseDto } from '../dto/out/user-response.dto.js';

export class UserMapper {
  static toUserResponseDto(entity: User): UserResponseDto {
    return {
      id: entity.id,
      email: entity.email,
      displayName: entity.displayName,
      role: entity.role,
      avatarUrl: entity.avatarUrl,
      createdAt: entity.createdAt,
    };
  }

  static toResponse(entity: User): ResponseDto<UserResponseDto> {
    return new ResponseDto(UserMapper.toUserResponseDto(entity));
  }

  static toPaginatedResponse(
    items: User[],
    total: number,
    page: number,
    limit: number,
  ): ResponseDto<PaginatedResponseDto<UserResponseDto>> {
    return new ResponseDto({
      items: items.map((item) => UserMapper.toUserResponseDto(item)),
      total,
      page,
      limit,
    });
  }
}
