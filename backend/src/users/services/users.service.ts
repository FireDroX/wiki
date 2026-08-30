import { Inject, Injectable } from '@nestjs/common';
import { UserNotFoundException } from '../../common/exceptions/users/user-not-found.exception.js';
import { ValidationException } from '../../common/exceptions/validation.exception.js';
import {
  DISPLAY_NAME_MAX_LENGTH,
  DISPLAY_NAME_MIN_LENGTH,
} from '../../common/variables.global.js';
import { CreateUserDto } from '../dto/in/create-user.dto.js';
import { UpdateProfileDto } from '../dto/in/update-profile.dto.js';
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

  async updateProfile(id: string, dto: UpdateProfileDto): Promise<User> {
    this.validateUpdateProfile(dto);
    await this.findById(id);
    return this.userRepository.update(id, dto);
  }

  private validateUpdateProfile(dto: UpdateProfileDto): void {
    const errors: string[] = [];

    if (dto.displayName !== undefined) {
      if (dto.displayName.length < DISPLAY_NAME_MIN_LENGTH) {
        errors.push(
          `displayName must be longer than or equal to ${DISPLAY_NAME_MIN_LENGTH} characters`,
        );
      } else if (dto.displayName.length > DISPLAY_NAME_MAX_LENGTH) {
        errors.push(
          `displayName must be shorter than or equal to ${DISPLAY_NAME_MAX_LENGTH} characters`,
        );
      }
    }

    if (errors.length > 0) {
      throw new ValidationException(errors.join(', '));
    }
  }
}
