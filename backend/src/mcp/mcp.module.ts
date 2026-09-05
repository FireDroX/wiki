import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaModule } from '../media/media.module.js';
import { PagesModule } from '../pages/pages.module.js';
import { SearchModule } from '../search/search.module.js';
import { TagsModule } from '../tags/tags.module.js';
import { UsersModule } from '../users/users.module.js';
import { McpApiKeysController } from './api-keys.controller.js';
import { McpApiKey } from './entities/mcp-api-key.entity.js';
import { McpApiKeyGuard } from './guards/mcp-api-key.guard.js';
import { McpController } from './mcp.controller.js';
import { TypeormMcpApiKeyRepository } from './persistence/typeorm.mcp-api-key.repository.js';
import {
  McpToolsBootstrapService,
  McpToolsRegistry,
} from './registry/mcp-tools.registry.js';
import { ApiKeysService } from './services/api-keys.service.js';
import { McpServerService } from './services/mcp-server.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([McpApiKey]),
    PagesModule,
    TagsModule,
    UsersModule,
    MediaModule,
    SearchModule,
  ],
  controllers: [McpController, McpApiKeysController],
  providers: [
    { provide: 'McpApiKeysRepository', useClass: TypeormMcpApiKeyRepository },
    ApiKeysService,
    McpApiKeyGuard,
    McpToolsRegistry,
    McpToolsBootstrapService,
    McpServerService,
  ],
})
export class McpModule {}
