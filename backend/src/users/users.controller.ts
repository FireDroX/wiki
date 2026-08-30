import { Controller, Get, UseFilters, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { ResponseDto } from '../common/dto/response.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import type { AuthenticatedUser } from '../common/strategies/jwt.strategy.js';
import { UserResponseDto } from './dto/out/user-response.dto.js';
import { UsersExceptionFilter } from './filter/users-exception.filter.js';
import { UserMapper } from './mapper/user.mapper.js';
import { UsersService } from './services/users.service.js';

@Controller('users')
@UseFilters(UsersExceptionFilter)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ResponseDto<UserResponseDto>> {
    const entity = await this.usersService.findById(user.id);
    return UserMapper.toMeResponse(entity);
  }
}
