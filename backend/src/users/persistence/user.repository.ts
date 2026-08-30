import { CreateUserDto } from '../dto/in/create-user.dto.js';
import { User } from '../entities/user.entity.js';

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserDto): Promise<User>;
}
