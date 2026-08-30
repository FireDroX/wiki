import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseFilters,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ResponseDto } from '../common/dto/response.dto.js';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from '../common/variables.global.js';
import { LoginDto } from './dto/in/login.dto.js';
import { RegisterDto } from './dto/in/register.dto.js';
import { UserResponseDto } from './dto/out/user-response.dto.js';
import { AuthExceptionFilter } from './filter/auth-exception.filter.js';
import { UserMapper } from './mapper/user.mapper.js';
import { AuthService, type TokenPair } from './services/auth.service.js';

const ACCESS_TOKEN_MAX_AGE_MS = 15 * 60 * 1000;
const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

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

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ResponseDto<null>> {
    const tokens = await this.authService.login(dto);
    this.setAuthCookies(res, tokens);
    return new ResponseDto(null);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): ResponseDto<null> {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE] as
      string | undefined;
    const { accessToken } = this.authService.refresh(refreshToken);
    this.setCookie(
      res,
      ACCESS_TOKEN_COOKIE,
      accessToken,
      ACCESS_TOKEN_MAX_AGE_MS,
    );
    return new ResponseDto(null);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response): ResponseDto<null> {
    res.clearCookie(ACCESS_TOKEN_COOKIE, { path: '/' });
    res.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/' });
    return new ResponseDto(null);
  }

  private setAuthCookies(res: Response, tokens: TokenPair): void {
    this.setCookie(
      res,
      ACCESS_TOKEN_COOKIE,
      tokens.accessToken,
      ACCESS_TOKEN_MAX_AGE_MS,
    );
    this.setCookie(
      res,
      REFRESH_TOKEN_COOKIE,
      tokens.refreshToken,
      REFRESH_TOKEN_MAX_AGE_MS,
    );
  }

  private setCookie(
    res: Response,
    name: string,
    value: string,
    maxAge: number,
  ): void {
    res.cookie(name, value, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge,
    });
  }
}
