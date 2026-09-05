import { Injectable, OnModuleInit } from '@nestjs/common';
import type { ZodRawShape } from 'zod';

export interface McpToolContext {
  scopes: string[];
}

export interface McpToolDefinition<TInput = any> {
  name: string;
  description: string;
  inputSchema: ZodRawShape;
  requiredScopes: string[];
  hideWithoutScope?: boolean;
  handler: (input: TInput, ctx: McpToolContext) => Promise<unknown>;
}

@Injectable()
export class McpToolsRegistry {
  private readonly tools: McpToolDefinition[] = [];

  register(...tools: McpToolDefinition[]): void {
    this.tools.push(...tools);
  }

  getAll(): McpToolDefinition[] {
    return this.tools;
  }

  findByName(name: string): McpToolDefinition | undefined {
    return this.tools.find((tool) => tool.name === name);
  }

  getVisibleForScopes(scopes: string[] | null): McpToolDefinition[] {
    if (scopes === null) {
      return this.tools;
    }
    return this.tools.filter(
      (tool) =>
        !tool.hideWithoutScope ||
        tool.requiredScopes.some((scope) => scopes.includes(scope)),
    );
  }
}

@Injectable()
export class McpToolsBootstrapService implements OnModuleInit {
  constructor(private readonly registry: McpToolsRegistry) {}

  onModuleInit(): void {
    // Chaque ticket suivant (BE-093 à BE-097) enregistre ses tools ici,
    // ex. `this.registry.register(...buildPagesTools(this.pagesService))`.
  }
}
