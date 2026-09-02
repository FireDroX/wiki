import { ApiProperty } from '@nestjs/swagger';
import { USER_ROLES } from '../../entities/user.entity.js';
import type { UserRole } from '../../entities/user.entity.js';

export class UpdateRoleDto {
  @ApiProperty({ enum: USER_ROLES })
  role: UserRole;
}
