import { apiClient } from '#lib/api-client'

export type PublicSettings = Record<string, string>

export async function getSettings(): Promise<PublicSettings> {
  const { data } = await apiClient.get<PublicSettings>('/settings')
  return data
}

export async function updateSetting(key: string, value: string): Promise<{ key: string; value: string }> {
  const { data } = await apiClient.patch<{ key: string; value: string }>(`/admin/settings/${key}`, { value })
  return data
}
