export interface CreateMcpAuditLogInput {
  apiKeyId: string;
  toolName: string;
  input: unknown;
  output: unknown;
  success: boolean;
  errorMessage: string | null;
}

export interface McpAuditLogRow {
  id: string;
  apiKeyName: string;
  toolName: string;
  input: unknown;
  output: unknown;
  success: boolean;
  errorMessage: string | null;
  createdAt: Date;
}

export interface McpAuditLogRepository {
  create(data: CreateMcpAuditLogInput): Promise<void>;
  findAllPaginated(
    apiKeyId: string | undefined,
    page: number,
    limit: number,
  ): Promise<{ items: McpAuditLogRow[]; total: number }>;
}
