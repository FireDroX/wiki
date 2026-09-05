import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { McpApiKey } from '../entities/mcp-api-key.entity.js';
import {
  CreateMcpApiKeyInput,
  McpApiKeyRepository,
} from './mcp-api-key.repository.js';

@Injectable()
export class TypeormMcpApiKeyRepository implements McpApiKeyRepository {
  constructor(
    @InjectRepository(McpApiKey)
    private readonly repository: Repository<McpApiKey>,
  ) {}

  async create(data: CreateMcpApiKeyInput): Promise<McpApiKey> {
    return this.repository.save(this.repository.create(data));
  }

  findAll(): Promise<McpApiKey[]> {
    return this.repository.find({ order: { createdAt: 'DESC' } });
  }

  findById(id: string): Promise<McpApiKey | null> {
    return this.repository.findOneBy({ id });
  }

  findByHash(keyHash: string): Promise<McpApiKey | null> {
    return this.repository.findOneBy({ keyHash });
  }

  async revoke(id: string): Promise<void> {
    await this.repository.update(id, { revokedAt: new Date() });
  }

  async touchLastUsed(id: string): Promise<void> {
    await this.repository.update(id, { lastUsedAt: new Date() });
  }
}
