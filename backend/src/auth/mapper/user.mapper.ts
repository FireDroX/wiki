import { ResponseDto } from '../../common/dto/response.dto.js';
import { User } from '../../users/entities/user.entity.js';
import { UserResponseDto } from '../dto/out/user-response.dto.js';

export class UserMapper {
  static toUserResponseDto(entity: User): UserResponseDto {
    return {
      id: entity.id,
      email: entity.email,
      displayName: entity.displayName,
      role: entity.role,
    };
  }

  static toRegisterResponse(entity: User): ResponseDto<UserResponseDto> {
    return new ResponseDto(UserMapper.toUserResponseDto(entity));
  }
}
