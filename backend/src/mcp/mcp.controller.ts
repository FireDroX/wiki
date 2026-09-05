import { randomUUID } from 'node:crypto';
import { Controller, Delete, Get, Post, Req, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import type { Request, Response } from 'express';
import { McpServerService } from './services/mcp-server.service.js';

const SESSION_ID_HEADER = 'mcp-session-id';

@ApiExcludeController()
@Controller('mcp')
export class McpController {
  private readonly transports = new Map<
    string,
    StreamableHTTPServerTransport
  >();

  constructor(private readonly mcpServerService: McpServerService) {}

  @Post()
  async handlePost(@Req() req: Request, @Res() res: Response): Promise<void> {
    const sessionId = McpController.getSessionId(req);
    let transport = sessionId ? this.transports.get(sessionId) : undefined;

    if (!transport) {
      if (sessionId) {
        McpController.sendJsonRpcError(res, 'Session not found');
        return;
      }

      if (!isInitializeRequest(req.body)) {
        McpController.sendJsonRpcError(res, 'No valid session ID provided');
        return;
      }

      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (id) => {
          this.transports.set(id, transport!);
        },
      });

      transport.onclose = () => {
        if (transport?.sessionId) {
          this.transports.delete(transport.sessionId);
        }
      };

      const server = this.mcpServerService.createServer();
      await server.connect(transport);
    }

    await transport.handleRequest(req, res, req.body);
  }

  @Get()
  async handleGet(@Req() req: Request, @Res() res: Response): Promise<void> {
    const transport = this.getExistingTransport(req, res);
    if (!transport) {
      return;
    }
    await transport.handleRequest(req, res);
  }

  @Delete()
  async handleDelete(@Req() req: Request, @Res() res: Response): Promise<void> {
    const transport = this.getExistingTransport(req, res);
    if (!transport) {
      return;
    }
    await transport.handleRequest(req, res);
  }

  private getExistingTransport(
    req: Request,
    res: Response,
  ): StreamableHTTPServerTransport | undefined {
    const sessionId = McpController.getSessionId(req);
    const transport = sessionId ? this.transports.get(sessionId) : undefined;
    if (!transport) {
      res.status(400).send('Invalid or missing session ID');
      return undefined;
    }
    return transport;
  }

  private static getSessionId(req: Request): string | undefined {
    const header = req.headers[SESSION_ID_HEADER];
    return typeof header === 'string' ? header : undefined;
  }

  private static sendJsonRpcError(res: Response, message: string): void {
    res.status(400).json({
      jsonrpc: '2.0',
      error: { code: -32000, message: `Bad Request: ${message}` },
      id: null,
    });
  }
}
