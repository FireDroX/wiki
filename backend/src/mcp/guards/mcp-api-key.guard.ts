import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { InvalidApiKeyException } from '../../common/exceptions/mcp/invalid-api-key.exception.js';
import { ApiKeysService } from '../services/api-keys.service.js';
import type { McpAuthContext } from '../services/api-keys.service.js';

const BEARER_PREFIX = 'Bearer ';

export interface McpAuthenticatedRequest extends Request {
  mcpAuth: McpAuthContext;
}

@Injectable()
export class McpApiKeyGuard implements CanActivate {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<McpAuthenticatedRequest>();

    const header = request.headers.authorization;
    if (!header || !header.startsWith(BEARER_PREFIX)) {
      throw new InvalidApiKeyException();
    }

    const token = header.slice(BEARER_PREFIX.length);
    request.mcpAuth = await this.apiKeysService.validate(token);

    return true;
  }
}
