import { ResponseDto } from '../../common/dto/response.dto.js';
import { AccessTokenResponseDto } from '../dto/out/access-token-response.dto.js';
import { TokenResponseDto } from '../dto/out/token-response.dto.js';

export class TokenMapper {
  static toLoginResponse(
    tokens: TokenResponseDto,
  ): ResponseDto<TokenResponseDto> {
    return new ResponseDto(tokens);
  }

  static toRefreshResponse(
    tokens: AccessTokenResponseDto,
  ): ResponseDto<AccessTokenResponseDto> {
    return new ResponseDto(tokens);
  }
}
