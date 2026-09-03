import { apiClient } from '#lib/api-client'
import type { ResponseDto } from '#api/response-dto'

export interface PagePermission {
  id: string
  pageId: string
  userId: string
  grantedById: string
  createdAt: string
}

export async function listPermissions(pageId: string): Promise<PagePermission[]> {
  const { data } = await apiClient.get<ResponseDto<PagePermission[]>>(`/pages/${pageId}/permissions`)
  return data.data
}

export async function grantPermission(pageId: string, userId: string): Promise<PagePermission> {
  const { data } = await apiClient.post<ResponseDto<PagePermission>>(`/pages/${pageId}/permissions`, { userId })
  return data.data
}

export async function revokePermission(pageId: string, userId: string): Promise<void> {
  await apiClient.delete(`/pages/${pageId}/permissions/${userId}`)
}
