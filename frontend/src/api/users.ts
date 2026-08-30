import { apiClient } from '#lib/api-client'
import type { ResponseDto } from '#api/response-dto'
import type { AuthUser } from '#api/auth'

export async function getMe(): Promise<AuthUser> {
  const { data } = await apiClient.get<ResponseDto<AuthUser>>('/users/me')
  return data.data
}
