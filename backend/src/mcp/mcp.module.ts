import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaModule } from '../media/media.module.js';
import { PagesModule } from '../pages/pages.module.js';
import { SearchModule } from '../search/search.module.js';
import { TagsModule } from '../tags/tags.module.js';
import { UsersModule } from '../users/users.module.js';
import { McpApiKeysController } from './api-keys.controller.js';
import { McpAuditLogController } from './audit-log.controller.js';
import { McpApiKey } from './entities/mcp-api-key.entity.js';
import { McpAuditLog } from './entities/mcp-audit-log.entity.js';
import { McpApiKeyGuard } from './guards/mcp-api-key.guard.js';
import { McpAuditInterceptor } from './interceptors/mcp-audit.interceptor.js';
import { McpController } from './mcp.controller.js';
import { TypeormMcpApiKeyRepository } from './persistence/typeorm.mcp-api-key.repository.js';
import { TypeormMcpAuditLogRepository } from './persistence/typeorm.mcp-audit-log.repository.js';
import {
  McpToolsBootstrapService,
  McpToolsRegistry,
} from './registry/mcp-tools.registry.js';
import { ApiKeysService } from './services/api-keys.service.js';
import { McpAuditService } from './services/mcp-audit.service.js';
import { McpServerService } from './services/mcp-server.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([McpApiKey, McpAuditLog]),
    PagesModule,
    TagsModule,
    UsersModule,
    MediaModule,
    SearchModule,
  ],
  controllers: [McpController, McpApiKeysController, McpAuditLogController],
  providers: [
    { provide: 'McpApiKeysRepository', useClass: TypeormMcpApiKeyRepository },
    {
      provide: 'McpAuditLogsRepository',
      useClass: TypeormMcpAuditLogRepository,
    },
    ApiKeysService,
    McpAuditService,
    McpAuditInterceptor,
    McpApiKeyGuard,
    McpToolsRegistry,
    McpToolsBootstrapService,
    McpServerService,
  ],
})
export class McpModule {}
