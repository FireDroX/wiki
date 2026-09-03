import { SearchResultDto } from './search-result.dto.js';

export interface SearchResponseDto {
  results: SearchResultDto[];
  total: number;
}
