import { randomBytes, createHash } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { InvalidApiKeyException } from '../../common/exceptions/mcp/invalid-api-key.exception.js';
import { McpApiKeyNotFoundException } from '../../common/exceptions/mcp/mcp-api-key-not-found.exception.js';
import { ValidationException } from '../../common/exceptions/validation.exception.js';
import { MCP_SCOPES } from '../../common/variables.global.js';
import { CreateApiKeyDto } from '../dto/in/create-api-key.dto.js';
import { McpApiKey } from '../entities/mcp-api-key.entity.js';
import type { McpApiKeyRepository } from '../persistence/mcp-api-key.repository.js';

const API_KEY_PREFIX = 'sk_';

export interface McpAuthContext {
  apiKeyId: string;
  scopes: string[];
  createdById: string;
}

@Injectable()
export class ApiKeysService {
  constructor(
    @Inject('McpApiKeysRepository')
    private readonly apiKeyRepository: McpApiKeyRepository,
  ) {}

  async createKey(
    dto: CreateApiKeyDto,
    createdById: string,
  ): Promise<{ entity: McpApiKey; plainKey: string }> {
    this.validateScopes(dto.scopes);

    const plainKey = ApiKeysService.generateKey();
    const entity = await this.apiKeyRepository.create({
      name: dto.name,
      keyHash: ApiKeysService.hash(plainKey),
      scopes: dto.scopes,
      createdById,
    });

    return { entity, plainKey };
  }

  listKeys(): Promise<McpApiKey[]> {
    return this.apiKeyRepository.findAll();
  }

  async revokeKey(id: string): Promise<void> {
    const key = await this.apiKeyRepository.findById(id);
    if (!key) {
      throw new McpApiKeyNotFoundException();
    }
    await this.apiKeyRepository.revoke(id);
  }

  async validate(plainKey: string): Promise<McpAuthContext> {
    const entity = await this.apiKeyRepository.findByHash(
      ApiKeysService.hash(plainKey),
    );
    if (!entity || entity.revokedAt !== null) {
      throw new InvalidApiKeyException();
    }
    return {
      apiKeyId: entity.id,
      scopes: entity.scopes,
      createdById: entity.createdById,
    };
  }

  touchLastUsed(id: string): Promise<void> {
    return this.apiKeyRepository.touchLastUsed(id);
  }

  private validateScopes(scopes: string[]): void {
    if (
      !Array.isArray(scopes) ||
      scopes.length === 0 ||
      !scopes.every((scope) => MCP_SCOPES.includes(scope))
    ) {
      throw new ValidationException(
        `scopes must be a non-empty array of: ${MCP_SCOPES.join(', ')}`,
      );
    }
  }

  private static generateKey(): string {
    return `${API_KEY_PREFIX}${randomBytes(24).toString('hex')}`;
  }

  private static hash(key: string): string {
    return createHash('sha256').update(key).digest('hex');
  }
}
