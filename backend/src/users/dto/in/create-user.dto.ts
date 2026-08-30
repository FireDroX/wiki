import { UserRole } from '../../entities/user.entity.js';

export class CreateUserDto {
  email: string;
  passwordHash: string;
  displayName: string;
  role: UserRole;
}
