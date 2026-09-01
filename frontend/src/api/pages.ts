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

export type PageVisibility = 'public' | 'private'

export interface PageDetail {
  id: string
  slug: string
  title: string
  content: string
  visibility: PageVisibility
  isPublished: boolean
  parentId: string | null
  updatedAt: string
}

export async function getPageByPath(pathSegments: string[]): Promise<PageDetail> {
  const path = pathSegments.map(encodeURIComponent).join('/')
  const { data } = await apiClient.get<ResponseDto<PageDetail>>(`/pages/${path}`)
  return data.data
}
