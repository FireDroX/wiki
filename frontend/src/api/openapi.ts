import { apiClient } from '#lib/api-client'

export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete'

export interface OpenApiSchema {
  type?: string
  $ref?: string
  enum?: string[]
  nullable?: boolean
  items?: OpenApiSchema
  properties?: Record<string, OpenApiSchema>
  required?: string[]
}

export interface OpenApiParameter {
  name: string
  in: string
  required?: boolean
  schema?: OpenApiSchema
}

interface OpenApiContent {
  schema?: OpenApiSchema
}

export interface OpenApiOperation {
  operationId: string
  summary?: string
  tags?: string[]
  parameters?: OpenApiParameter[]
  requestBody?: {
    required?: boolean
    content?: Record<string, OpenApiContent>
  }
  responses: Record<string, { description?: string; content?: Record<string, OpenApiContent> }>
  security?: Array<Record<string, string[]>>
}

export interface OpenApiDocument {
  paths: Record<string, Partial<Record<HttpMethod, OpenApiOperation>>>
  components?: { schemas?: Record<string, OpenApiSchema> }
}

export async function getOpenApiDocument(): Promise<OpenApiDocument> {
  const { data } = await apiClient.get<OpenApiDocument>('/docs-json')
  return data
}
