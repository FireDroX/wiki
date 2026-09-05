import { Module } from '@nestjs/common';
import { MediaModule } from '../media/media.module.js';
import { PagesModule } from '../pages/pages.module.js';
import { SearchModule } from '../search/search.module.js';
import { TagsModule } from '../tags/tags.module.js';
import { UsersModule } from '../users/users.module.js';
import { McpController } from './mcp.controller.js';
import {
  McpToolsBootstrapService,
  McpToolsRegistry,
} from './registry/mcp-tools.registry.js';
import { McpServerService } from './services/mcp-server.service.js';

@Module({
  imports: [PagesModule, TagsModule, UsersModule, MediaModule, SearchModule],
  controllers: [McpController],
  providers: [McpToolsRegistry, McpToolsBootstrapService, McpServerService],
})
export class McpModule {}
