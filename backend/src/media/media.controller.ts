import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiPayloadTooLargeResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnsupportedMediaTypeResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { ErrorResponseDto } from '../common/dto/error-response.dto.js';
import { ResponseDto } from '../common/dto/response.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import type { AuthenticatedUser } from '../common/strategies/jwt.strategy.js';
import { MAX_ATTACHMENT_SIZE_MB } from '../common/variables.global.js';
import { UploadMediaDto } from './dto/in/upload-media.dto.js';
import { AttachmentResponseDto } from './dto/out/attachment-response.dto.js';
import { MediaExceptionFilter } from './filter/media-exception.filter.js';
import { AttachmentMapper } from './mapper/attachment.mapper.js';
import { MediaService, UploadedMediaFile } from './services/media.service.js';

@ApiTags('Media')
@Controller('media')
@UseFilters(MediaExceptionFilter)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('editor', 'admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Uploader un fichier vers Minio' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        pageId: { type: 'string', nullable: true },
      },
    },
  })
  @ApiCreatedResponse({ description: 'Fichier uploadé avec succès.' })
  @ApiBadRequestResponse({
    description: 'Aucun fichier fourni ou pageId invalide.',
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
  @ApiPayloadTooLargeResponse({
    description: `Fichier de plus de ${MAX_ATTACHMENT_SIZE_MB} Mo.`,
    type: ErrorResponseDto,
  })
  @ApiUnsupportedMediaTypeResponse({
    description: 'Type de fichier non autorisé.',
    type: ErrorResponseDto,
  })
  async upload(
    @UploadedFile() file: UploadedMediaFile | undefined,
    @Body() dto: UploadMediaDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ResponseDto<AttachmentResponseDto>> {
    const { attachment, url } = await this.mediaService.uploadFile(
      file,
      dto,
      user.id,
    );
    return AttachmentMapper.toResponse(attachment, url);
  }
}
