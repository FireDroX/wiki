import { Injectable } from '@nestjs/common';
import { ApiKeysService } from '../services/api-keys.service.js';
import { McpAuditService } from '../services/mcp-audit.service.js';

@Injectable()
export class McpAuditInterceptor {
  constructor(
    private readonly auditService: McpAuditService,
    private readonly apiKeysService: ApiKeysService,
  ) {}

  async wrap<T>(
    apiKeyId: string,
    toolName: string,
    input: unknown,
    execute: () => Promise<T>,
  ): Promise<T> {
    try {
      const output = await execute();
      await Promise.all([
        this.auditService.logAction({
          apiKeyId,
          toolName,
          input,
          output,
          success: true,
          errorMessage: null,
        }),
        this.apiKeysService.touchLastUsed(apiKeyId),
      ]);
      return output;
    } catch (error) {
      await this.auditService.logAction({
        apiKeyId,
        toolName,
        input,
        output: null,
        success: false,
        errorMessage:
          error instanceof Error ? error.message : 'Unexpected error',
      });
      throw error;
    }
  }
}
