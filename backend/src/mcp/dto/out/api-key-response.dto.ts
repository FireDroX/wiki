export interface ApiKeyCreatedResponseDto {
  id: string;
  name: string;
  key: string;
  scopes: string[];
  createdAt: Date;
}

export interface ApiKeySummaryDto {
  id: string;
  name: string;
  scopes: string[];
  lastUsedAt: Date | null;
  revokedAt: Date | null;
  createdAt: Date;
}
