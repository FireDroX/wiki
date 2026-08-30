import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { QueryFailedError } from 'typeorm';
import { EmailAlreadyExistsException } from '../../common/exceptions/auth/email-already-exists.exception.js';
import { InvalidCredentialsException } from '../../common/exceptions/auth/invalid-credentials.exception.js';
import { ValidationException } from '../../common/exceptions/validation.exception.js';
import {
  DISPLAY_NAME_MAX_LENGTH,
  DISPLAY_NAME_MIN_LENGTH,
  EMAIL_REGEX,
  MIN_PASSWORD_LENGTH,
} from '../../common/variables.global.js';
import { User } from '../../users/entities/user.entity.js';
import { UsersService } from '../../users/services/users.service.js';
import { LoginDto } from '../dto/in/login.dto.js';
import { RegisterDto } from '../dto/in/register.dto.js';
import { TokenResponseDto } from '../dto/out/token-response.dto.js';

const SALT_ROUNDS = 10;
const MYSQL_DUPLICATE_ENTRY_CODE = 'ER_DUP_ENTRY';
const ACCESS_TOKEN_EXPIRATION = '15m';
const REFRESH_TOKEN_EXPIRATION = '7d';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

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

  async login(dto: LoginDto): Promise<TokenResponseDto> {
    this.validateLogin(dto);

    const user = await this.validateUser(dto.email, dto.password);
    return this.generateTokens(user);
  }

  private async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new InvalidCredentialsException();
    }
    return user;
  }

  private generateTokens(user: User): TokenResponseDto {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: ACCESS_TOKEN_EXPIRATION,
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: REFRESH_TOKEN_EXPIRATION,
    });

    return { accessToken, refreshToken };
  }

  private validateLogin(dto: LoginDto): void {
    const errors: string[] = [];

    if (!dto.email || !EMAIL_REGEX.test(dto.email)) {
      errors.push('email must be a valid email');
    }
    if (!dto.password) {
      errors.push('password should not be empty');
    }

    if (errors.length > 0) {
      throw new ValidationException(errors.join(', '));
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
