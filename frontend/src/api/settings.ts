import { apiClient } from '#lib/api-client'

export async function updateSetting(key: string, value: string): Promise<{ key: string; value: string }> {
  const { data } = await apiClient.patch<{ key: string; value: string }>(`/admin/settings/${key}`, { value })
  return data
}
