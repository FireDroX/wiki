import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto.js';
import { ResponseDto } from '../common/dto/response.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import type { AuthenticatedUser } from '../common/strategies/jwt.strategy.js';
import { DiffVersionsDto } from '../versions/dto/in/diff-versions.dto.js';
import { ListVersionsQueryDto } from '../versions/dto/in/list-versions-query.dto.js';
import { DiffResponseDto } from '../versions/dto/out/diff-response.dto.js';
import { VersionDetailResponseDto } from '../versions/dto/out/version-detail-response.dto.js';
import { VersionSummaryResponseDto } from '../versions/dto/out/version-summary-response.dto.js';
import { VersionMapper } from '../versions/mapper/version.mapper.js';
import { VersionsService } from '../versions/services/versions.service.js';
import { CreatePageDto } from './dto/in/create-page.dto.js';
import { DeletePageQueryDto } from './dto/in/delete-page-query.dto.js';
import { MovePageDto } from './dto/in/move-page.dto.js';
import { PublishPageDto } from './dto/in/publish-page.dto.js';
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
  constructor(
    private readonly pagesService: PagesService,
    private readonly versionsService: VersionsService,
  ) {}

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

  @Patch(':id/move')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('editor', 'admin')
  async move(
    @Param('id') id: string,
    @Body() dto: MovePageDto,
  ): Promise<ResponseDto<PageResponseDto>> {
    const { page, version } = await this.pagesService.movePage(id, dto);
    return PageMapper.toResponse(page, version);
  }

  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('editor', 'admin')
  async publish(
    @Param('id') id: string,
    @Body() dto: PublishPageDto,
  ): Promise<ResponseDto<PageResponseDto>> {
    const { page, version } = await this.pagesService.setPublishStatus(id, dto);
    return PageMapper.toResponse(page, version);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('editor', 'admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @Query() query: DeletePageQueryDto,
  ): Promise<void> {
    await this.pagesService.deletePage(id, query);
  }

  @Get('tree')
  @UseGuards(OptionalJwtAuthGuard)
  async getTree(
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<ResponseDto<PageTreeNodeDto[]>> {
    const tree = await this.pagesService.getTree(user);
    return new ResponseDto(tree);
  }

  @Get(':id/versions')
  @UseGuards(OptionalJwtAuthGuard)
  async listVersions(
    @Param('id') id: string,
    @Query() query: ListVersionsQueryDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<ResponseDto<PaginatedResponseDto<VersionSummaryResponseDto>>> {
    await this.pagesService.getByIdOrFail(id, user);
    const { items, total, page, limit } =
      await this.versionsService.findAllByPage(id, query);
    return VersionMapper.toPaginatedResponse(items, total, page, limit);
  }

  @Get(':id/versions/:versionId')
  @UseGuards(OptionalJwtAuthGuard)
  async getVersion(
    @Param('id') id: string,
    @Param('versionId') versionId: string,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<ResponseDto<VersionDetailResponseDto>> {
    await this.pagesService.getByIdOrFail(id, user);
    const version = await this.versionsService.findOne(id, versionId);
    return VersionMapper.toDetailResponse(version);
  }

  @Post(':id/versions/diff')
  @UseGuards(OptionalJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async diffVersions(
    @Param('id') id: string,
    @Body() dto: DiffVersionsDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<ResponseDto<DiffResponseDto>> {
    await this.pagesService.getByIdOrFail(id, user);
    const diff = await this.versionsService.computeDiff(id, dto.from, dto.to);
    return new ResponseDto(diff);
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
