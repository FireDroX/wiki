export interface AuditLogItemDto {
  id: string;
  apiKeyName: string;
  toolName: string;
  success: boolean;
  input: unknown;
  output: unknown;
  errorMessage: string | null;
  createdAt: Date;
}

export interface AuditLogListDto {
  items: AuditLogItemDto[];
  total: number;
}
