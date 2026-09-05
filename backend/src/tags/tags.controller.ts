import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { ErrorResponseDto } from '../common/dto/error-response.dto.js';
import { ResponseDto } from '../common/dto/response.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import type { AuthenticatedUser } from '../common/strategies/jwt.strategy.js';
import { CreateTagDto } from './dto/in/create-tag.dto.js';
import { PageTagResponseDto } from './dto/out/page-tag-response.dto.js';
import { TagResponseDto, TagSummaryDto } from './dto/out/tag-response.dto.js';
import { TagsExceptionFilter } from './filter/tags.exception.filter.js';
import { TagMapper } from './mapper/tag.mapper.js';
import { TagsService } from './services/tags.service.js';

@ApiTags('Tags')
@Controller('tags')
@UseFilters(TagsExceptionFilter)
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('editor', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer un tag' })
  @ApiBody({ type: CreateTagDto })
  @ApiCreatedResponse({ description: 'Tag créé.' })
  @ApiBadRequestResponse({
    description: 'Nom de tag invalide.',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Authentification requise.',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Rôle insuffisant (editor ou admin requis).',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Un tag avec ce nom existe déjà.',
    type: ErrorResponseDto,
  })
  async create(
    @Body() dto: CreateTagDto,
  ): Promise<ResponseDto<TagResponseDto>> {
    const tag = await this.tagsService.createTag(dto);
    return TagMapper.toResponse(tag);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les tags' })
  @ApiOkResponse({ description: 'Liste de tous les tags.' })
  async list(): Promise<ResponseDto<TagSummaryDto[]>> {
    const tags = await this.tagsService.listTags();
    return TagMapper.toListResponse(tags);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un tag (cascade sur les pages liées)' })
  @ApiParam({ name: 'id', description: 'Identifiant du tag' })
  @ApiNoContentResponse({ description: 'Tag supprimé.' })
  @ApiUnauthorizedResponse({
    description: 'Authentification requise.',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Rôle admin requis.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: "Le tag n'existe pas.",
    type: ErrorResponseDto,
  })
  async remove(@Param('id') id: string): Promise<void> {
    await this.tagsService.deleteTag(id);
  }
}

@ApiTags('Tags')
@Controller('pages/:id/tags')
@UseFilters(TagsExceptionFilter)
export class PageTagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: "Lister les tags d'une page" })
  @ApiParam({ name: 'id', description: 'Identifiant de la page' })
  @ApiOkResponse({ description: 'Tags associés à la page.' })
  @ApiForbiddenResponse({
    description: 'Page privée, accès non autorisé.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: "La page n'existe pas.",
    type: ErrorResponseDto,
  })
  async listPageTags(
    @Param('id') id: string,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<ResponseDto<TagSummaryDto[]>> {
    const tags = await this.tagsService.listPageTags(id, user);
    return TagMapper.toListResponse(tags);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('editor', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Associer un tag à une page' })
  @ApiParam({ name: 'id', description: 'Identifiant de la page' })
  @ApiBody({ schema: { properties: { tagId: { type: 'string' } } } })
  @ApiCreatedResponse({ description: 'Association créée.' })
  @ApiUnauthorizedResponse({
    description: 'Authentification requise.',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Rôle insuffisant (editor ou admin requis).',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: "La page ou le tag n'existe pas.",
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Le tag est déjà associé à cette page.',
    type: ErrorResponseDto,
  })
  async tagPage(
    @Param('id') id: string,
    @Body() dto: { tagId: string },
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ResponseDto<PageTagResponseDto>> {
    const pageTag = await this.tagsService.tagPage(id, dto.tagId, user);
    return TagMapper.toPageTagResponse(pageTag);
  }

  @Delete(':tagId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('editor', 'admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Retirer un tag d'une page" })
  @ApiParam({ name: 'id', description: 'Identifiant de la page' })
  @ApiParam({ name: 'tagId', description: 'Identifiant du tag' })
  @ApiNoContentResponse({ description: 'Association supprimée.' })
  @ApiUnauthorizedResponse({
    description: 'Authentification requise.',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Rôle insuffisant (editor ou admin requis).',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: "L'association n'existe pas.",
    type: ErrorResponseDto,
  })
  async untagPage(
    @Param('id') id: string,
    @Param('tagId') tagId: string,
  ): Promise<void> {
    await this.tagsService.untagPage(id, tagId);
  }
}
