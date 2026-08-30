import { CreateUserDto } from '../dto/in/create-user.dto.js';
import { UpdateProfileDto } from '../dto/in/update-profile.dto.js';
import { User } from '../entities/user.entity.js';

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserDto): Promise<User>;
  update(id: string, data: UpdateProfileDto): Promise<User>;
}
