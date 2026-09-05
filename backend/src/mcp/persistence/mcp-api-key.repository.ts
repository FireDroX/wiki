import { McpApiKey } from '../entities/mcp-api-key.entity.js';

export interface CreateMcpApiKeyInput {
  name: string;
  keyHash: string;
  scopes: string[];
  createdById: string;
}

export interface McpApiKeyRepository {
  create(data: CreateMcpApiKeyInput): Promise<McpApiKey>;
  findAll(): Promise<McpApiKey[]>;
  findById(id: string): Promise<McpApiKey | null>;
  findByHash(keyHash: string): Promise<McpApiKey | null>;
  revoke(id: string): Promise<void>;
  touchLastUsed(id: string): Promise<void>;
}
