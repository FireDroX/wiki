import { ResponseDto } from '../../common/dto/response.dto.js';
import { TokenResponseDto } from '../dto/out/token-response.dto.js';

export class TokenMapper {
  static toLoginResponse(
    tokens: TokenResponseDto,
  ): ResponseDto<TokenResponseDto> {
    return new ResponseDto(tokens);
  }
}
