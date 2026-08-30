import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { QueryFailedError } from 'typeorm';
import { EmailAlreadyExistsException } from '../../common/exceptions/auth/email-already-exists.exception.js';
import { ValidationException } from '../../common/exceptions/validation.exception.js';
import {
  DISPLAY_NAME_MAX_LENGTH,
  DISPLAY_NAME_MIN_LENGTH,
  EMAIL_REGEX,
  MIN_PASSWORD_LENGTH,
} from '../../common/variables.global.js';
import { User } from '../../users/entities/user.entity.js';
import { UsersService } from '../../users/services/users.service.js';
import { RegisterDto } from '../dto/in/register.dto.js';

const SALT_ROUNDS = 10;
const MYSQL_DUPLICATE_ENTRY_CODE = 'ER_DUP_ENTRY';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async register(dto: RegisterDto): Promise<User> {
    this.validate(dto);

    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new EmailAlreadyExistsException();
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    try {
      return await this.usersService.create({
        email: dto.email,
        passwordHash,
        displayName: dto.displayName,
        role: 'reader',
      });
    } catch (error) {
      if (AuthService.isDuplicateEmailError(error)) {
        throw new EmailAlreadyExistsException();
      }
      throw error;
    }
  }

  private validate(dto: RegisterDto): void {
    const errors: string[] = [];

    if (!dto.email || !EMAIL_REGEX.test(dto.email)) {
      errors.push('email must be a valid email');
    }
    if (!dto.password || dto.password.length < MIN_PASSWORD_LENGTH) {
      errors.push(
        `password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      );
    }
    if (
      !dto.displayName ||
      dto.displayName.length < DISPLAY_NAME_MIN_LENGTH ||
      dto.displayName.length > DISPLAY_NAME_MAX_LENGTH
    ) {
      errors.push(
        `displayName must be between ${DISPLAY_NAME_MIN_LENGTH} and ${DISPLAY_NAME_MAX_LENGTH} characters`,
      );
    }

    if (errors.length > 0) {
      throw new ValidationException(errors.join(', '));
    }
  }

  private static isDuplicateEmailError(error: unknown): boolean {
    return (
      error instanceof QueryFailedError &&
      (error as { driverError?: { code?: string } }).driverError?.code ===
        MYSQL_DUPLICATE_ENTRY_CODE
    );
  }
}
