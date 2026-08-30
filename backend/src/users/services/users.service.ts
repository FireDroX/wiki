import { Inject, Injectable } from '@nestjs/common';
import { UserNotFoundException } from '../../common/exceptions/users/user-not-found.exception.js';
import { CreateUserDto } from '../dto/in/create-user.dto.js';
import { User } from '../entities/user.entity.js';
import type { UserRepository } from '../persistence/user.repository.js';

@Injectable()
export class UsersService {
  constructor(
    @Inject('UsersRepository') private readonly userRepository: UserRepository,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundException();
    }
    return user;
  }

  findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  create(data: CreateUserDto): Promise<User> {
    return this.userRepository.create(data);
  }
}
