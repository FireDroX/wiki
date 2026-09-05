import { Injectable } from '@nestjs/common';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import type { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { InsufficientScopeException } from '../../common/exceptions/mcp/insufficient-scope.exception.js';
import { ValidationException } from '../../common/exceptions/validation.exception.js';
import {
  McpToolDefinition,
  McpToolsRegistry,
} from '../registry/mcp-tools.registry.js';

const SERVER_NAME = 'openwiki-mcp';
const SERVER_VERSION = '1.0.0';

@Injectable()
export class McpServerService {
  constructor(private readonly toolsRegistry: McpToolsRegistry) {}

  createServer(scopes: string[] | null = null): McpServer {
    const server = new McpServer({
      name: SERVER_NAME,
      version: SERVER_VERSION,
    });

    server.server.registerCapabilities({ tools: {} });

    server.server.setRequestHandler(ListToolsRequestSchema, () => ({
      tools: this.toolsRegistry
        .getVisibleForScopes(scopes)
        .map((tool) => McpServerService.toMcpTool(tool)),
    }));

    server.server.setRequestHandler(CallToolRequestSchema, (request) =>
      this.callTool(
        request.params.name,
        (request.params.arguments as Record<string, unknown>) ?? {},
        scopes,
      ),
    );

    return server;
  }

  private async callTool(
    name: string,
    args: Record<string, unknown>,
    scopes: string[] | null,
  ): Promise<CallToolResult> {
    try {
      const tool = this.toolsRegistry.findByName(name);
      if (!tool) {
        throw new ValidationException(`Unknown tool: ${name}`);
      }

      if (!McpServerService.hasRequiredScope(tool, scopes)) {
        throw new InsufficientScopeException(tool.requiredScopes);
      }

      const parsed = z.object(tool.inputSchema).safeParse(args);
      if (!parsed.success) {
        throw new ValidationException(
          `Invalid input: ${parsed.error.issues.map((issue) => issue.message).join(', ')}`,
        );
      }

      const output = await tool.handler(parsed.data, { scopes: scopes ?? [] });
      return { content: [{ type: 'text', text: JSON.stringify(output) }] };
    } catch (error) {
      return McpServerService.errorResult(
        error instanceof Error ? error.message : 'Unexpected error',
      );
    }
  }

  private static hasRequiredScope(
    tool: McpToolDefinition,
    scopes: string[] | null,
  ): boolean {
    if (tool.requiredScopes.length === 0 || scopes === null) {
      return true;
    }
    return tool.requiredScopes.some((scope) => scopes.includes(scope));
  }

  private static toMcpTool(tool: McpToolDefinition): Tool {
    return {
      name: tool.name,
      description: tool.description,
      inputSchema: z.toJSONSchema(z.object(tool.inputSchema), {
        target: 'draft-7',
      }) as Tool['inputSchema'],
    };
  }

  private static errorResult(message: string): CallToolResult {
    return { content: [{ type: 'text', text: message }], isError: true };
  }
}
