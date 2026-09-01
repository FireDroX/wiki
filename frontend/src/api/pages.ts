import { apiClient } from '#lib/api-client'
import type { ResponseDto } from '#api/response-dto'

export interface PageTreeNode {
  id: string
  slug: string
  title: string
  children: PageTreeNode[]
}

export async function getTree(): Promise<PageTreeNode[]> {
  const { data } = await apiClient.get<ResponseDto<PageTreeNode[]>>('/pages/tree')
  return data.data
}
