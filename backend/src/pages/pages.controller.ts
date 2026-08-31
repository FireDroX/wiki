import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { ResponseDto } from '../common/dto/response.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import type { AuthenticatedUser } from '../common/strategies/jwt.strategy.js';
import { CreatePageDto } from './dto/in/create-page.dto.js';
import { UpdatePageDto } from './dto/in/update-page.dto.js';
import { PageDetailResponseDto } from './dto/out/page-detail-response.dto.js';
import { PageResponseDto } from './dto/out/page-response.dto.js';
import { PageTreeNodeDto } from './dto/out/page-tree-node.dto.js';
import { PageUpdateResponseDto } from './dto/out/page-update-response.dto.js';
import { PagesExceptionFilter } from './filter/pages-exception.filter.js';
import { PageMapper } from './mapper/page.mapper.js';
import { PagesService } from './services/pages.service.js';

@Controller('pages')
@UseFilters(PagesExceptionFilter)
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('editor', 'admin')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreatePageDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ResponseDto<PageResponseDto>> {
    const { page, version } = await this.pagesService.createPage(dto, user.id);
    return PageMapper.toResponse(page, version);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('editor', 'admin')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePageDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ResponseDto<PageUpdateResponseDto>> {
    const { page, version } = await this.pagesService.updatePage(
      id,
      dto,
      user.id,
    );
    return PageMapper.toUpdateResponse(page, version);
  }

  @Get('tree')
  @UseGuards(OptionalJwtAuthGuard)
  async getTree(
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<ResponseDto<PageTreeNodeDto[]>> {
    const tree = await this.pagesService.getTree(user);
    return new ResponseDto(tree);
  }

  @Get('*path')
  @UseGuards(OptionalJwtAuthGuard)
  async getByPath(
    @Param('path') path: string[],
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<ResponseDto<PageDetailResponseDto>> {
    const { page, version } = await this.pagesService.findByPath(path, user);
    return PageMapper.toDetailResponse(page, version);
  }
}
