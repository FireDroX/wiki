import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator.js';
import { ErrorResponseDto } from '../common/dto/error-response.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { UpdateSettingDto } from './dto/in/update-setting.dto.js';
import type {
  PublicSettingsResponseDto,
  SystemSettingResponseDto,
} from './dto/out/system-setting-response.dto.js';
import { AdminExceptionFilter } from './filter/admin.exception.filter.js';
import { SystemSettingMapper } from './mapper/system-setting.mapper.js';
import { SystemSettingsService } from './services/system-settings.service.js';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly systemSettingsService: SystemSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer les réglages publics' })
  @ApiOkResponse({ description: 'Réglages publics (ex. langue de l’UI).' })
  async getPublicSettings(): Promise<PublicSettingsResponseDto> {
    const settings = await this.systemSettingsService.getAll();
    return SystemSettingMapper.toPublicSettingsResponse(settings);
  }
}

@ApiTags('Admin — Settings')
@ApiBearerAuth()
@Controller('admin/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@UseFilters(AdminExceptionFilter)
export class AdminSettingsController {
  constructor(private readonly systemSettingsService: SystemSettingsService) {}

  @Patch(':key')
  @ApiOperation({ summary: 'Modifier un réglage système' })
  @ApiParam({ name: 'key', description: 'Clé du réglage (ex. locale)' })
  @ApiBody({ type: UpdateSettingDto })
  @ApiOkResponse({ description: 'Réglage mis à jour.' })
  @ApiBadRequestResponse({
    description: 'Clé ou valeur invalide.',
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
  async updateSetting(
    @Param('key') key: string,
    @Body() dto: UpdateSettingDto,
  ): Promise<SystemSettingResponseDto> {
    const entity = await this.systemSettingsService.update(key, dto.value);
    return SystemSettingMapper.toResponse(entity);
  }
}
