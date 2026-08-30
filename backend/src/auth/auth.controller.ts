import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseFilters,
} from '@nestjs/common';
import { ResponseDto } from '../common/dto/response.dto.js';
import { RegisterDto } from './dto/in/register.dto.js';
import { UserResponseDto } from './dto/out/user-response.dto.js';
import { AuthExceptionFilter } from './filter/auth-exception.filter.js';
import { UserMapper } from './mapper/user.mapper.js';
import { AuthService } from './services/auth.service.js';

@Controller('auth')
@UseFilters(AuthExceptionFilter)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() dto: RegisterDto,
  ): Promise<ResponseDto<UserResponseDto>> {
    const user = await this.authService.register(dto);
    return UserMapper.toRegisterResponse(user);
  }
}
