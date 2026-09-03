import { apiClient } from '#lib/api-client'
import type { ResponseDto } from '#api/response-dto'
import type { AuthUser, UserRole } from '#api/auth'

export async function getMe(): Promise<AuthUser> {
  const { data } = await apiClient.get<ResponseDto<AuthUser>>('/users/me')
  return data.data
}

export interface AdminUser {
  id: string
  email: string
  displayName: string
  role: UserRole
  avatarUrl: string | null
}

export interface PaginatedUsers {
  items: AdminUser[]
  total: number
  page: number
  limit: number
}

export async function listUsers(page = 1, limit = 100): Promise<PaginatedUsers> {
  const { data } = await apiClient.get<ResponseDto<PaginatedUsers>>('/admin/users', {
    params: { page, limit },
  })
  return data.data
}
