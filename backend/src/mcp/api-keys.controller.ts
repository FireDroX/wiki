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
import { RolesGuard } from '../common/guards/roles.guard.js';
import type { AuthenticatedUser } from '../common/strategies/jwt.strategy.js';
import { CreateApiKeyDto } from './dto/in/create-api-key.dto.js';
import {
  ApiKeyCreatedResponseDto,
  ApiKeySummaryDto,
} from './dto/out/api-key-response.dto.js';
import { McpExceptionFilter } from './filter/mcp.exception.filter.js';
import { ApiKeyMapper } from './mapper/api-key.mapper.js';
import { ApiKeysService } from './services/api-keys.service.js';

@ApiTags('Admin — MCP')
@ApiBearerAuth()
@Controller('admin/mcp/api-keys')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@UseFilters(McpExceptionFilter)
export class McpApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une clé API MCP' })
  @ApiBody({ type: CreateApiKeyDto })
  @ApiCreatedResponse({
    description: 'Clé créée, affichée en clair une seule fois.',
  })
  @ApiBadRequestResponse({
    description: 'Scopes invalides.',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Authentification requise.',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Rôle admin requis.',
    type: ErrorResponseDto,
  })
  async create(
    @Body() dto: CreateApiKeyDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ResponseDto<ApiKeyCreatedResponseDto>> {
    const { entity, plainKey } = await this.apiKeysService.createKey(
      dto,
      user.id,
    );
    return ApiKeyMapper.toCreatedResponse(entity, plainKey);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les clés API MCP' })
  @ApiOkResponse({ description: 'Liste des clés (sans le secret).' })
  @ApiUnauthorizedResponse({
    description: 'Authentification requise.',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Rôle admin requis.',
    type: ErrorResponseDto,
  })
  async list(): Promise<ResponseDto<ApiKeySummaryDto[]>> {
    const keys = await this.apiKeysService.listKeys();
    return ApiKeyMapper.toListResponse(keys);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Révoquer une clé API MCP' })
  @ApiParam({ name: 'id', description: 'Identifiant de la clé' })
  @ApiNoContentResponse({ description: 'Clé révoquée.' })
  @ApiUnauthorizedResponse({
    description: 'Authentification requise.',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Rôle admin requis.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: "La clé n'existe pas.",
    type: ErrorResponseDto,
  })
  async revoke(@Param('id') id: string): Promise<void> {
    await this.apiKeysService.revokeKey(id);
  }
}
