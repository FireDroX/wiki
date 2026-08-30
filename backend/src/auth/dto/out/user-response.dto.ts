import { UserRole } from '../../../users/entities/user.entity.js';

export interface UserResponseDto {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
}
