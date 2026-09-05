import { apiClient } from '#lib/api-client'
import type { ResponseDto } from '#api/response-dto'

export interface TagSummary {
  id: string
  name: string
  color: string
}

export async function listTags(): Promise<TagSummary[]> {
  const { data } = await apiClient.get<ResponseDto<TagSummary[]>>('/tags')
  return data.data
}

export async function createTag(name: string, color: string): Promise<TagSummary> {
  const { data } = await apiClient.post<ResponseDto<TagSummary>>('/tags', { name, color })
  return data.data
}

export async function deleteTag(tagId: string): Promise<void> {
  await apiClient.delete(`/tags/${tagId}`)
}

export async function getPageTags(pageId: string): Promise<TagSummary[]> {
  const { data } = await apiClient.get<ResponseDto<TagSummary[]>>(`/pages/${pageId}/tags`)
  return data.data
}

export async function tagPage(pageId: string, tagId: string): Promise<void> {
  await apiClient.post(`/pages/${pageId}/tags`, { tagId })
}

export async function untagPage(pageId: string, tagId: string): Promise<void> {
  await apiClient.delete(`/pages/${pageId}/tags/${tagId}`)
}
