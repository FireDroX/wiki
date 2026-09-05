import { apiClient } from '#lib/api-client'
import type { ResponseDto } from '#api/response-dto'

export async function updateSetting(key: string, value: string): Promise<void> {
  await apiClient.patch<ResponseDto<null>>(`/admin/settings/${key}`, { value })
}
