import { Controller, Get, Query, UseFilters, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { ErrorResponseDto } from '../common/dto/error-response.dto.js';
import { ResponseDto } from '../common/dto/response.dto.js';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard.js';
import type { AuthenticatedUser } from '../common/strategies/jwt.strategy.js';
import { SearchQueryDto } from './dto/in/search-query.dto.js';
import { SearchResponseDto } from './dto/out/paginated-search-response.dto.js';
import { SearchExceptionFilter } from './filter/search-exception.filter.js';
import { SearchMapper } from './mapper/search.mapper.js';
import { SearchService } from './services/search.service.js';

@ApiTags('Search')
@Controller('search')
@UseFilters(SearchExceptionFilter)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Rechercher parmi les pages publiées',
    description:
      'Authentification optionnelle : un utilisateur editor/admin voit aussi les pages privées ou non publiées.',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Terme recherché, min 2 caractères.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Numéro de page, défaut 1.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Taille de page, défaut 20, max 50.',
  })
  @ApiOkResponse({
    description: 'Résultats de recherche triés par pertinence.',
  })
  @ApiBadRequestResponse({
    description: 'q manquant ou trop court.',
    type: ErrorResponseDto,
  })
  async search(
    @Query() query: SearchQueryDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<ResponseDto<SearchResponseDto>> {
    const { items, total, q } = await this.searchService.search(query, user);
    return SearchMapper.toResponse(items, total, q);
  }
}
