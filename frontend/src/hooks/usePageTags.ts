import { useEffect, useState } from 'react'
import { getPageTags, type TagSummary } from '#api/tags'

export type PageTagsStatus = 'loading' | 'ready'

export interface UsePageTagsResult {
  tags: TagSummary[]
  status: PageTagsStatus
}

export function usePageTags(pageId: string | undefined): UsePageTagsResult {
  const [tags, setTags] = useState<TagSummary[]>([])
  const [loadedForId, setLoadedForId] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!pageId) {
      setTags([])
      setLoadedForId(undefined)
      return
    }

    let cancelled = false

    getPageTags(pageId)
      .then((result) => {
        if (cancelled) return
        setTags(result)
        setLoadedForId(pageId)
      })
      .catch(() => {
        if (cancelled) return
        setTags([])
        setLoadedForId(pageId)
      })

    return () => {
      cancelled = true
    }
  }, [pageId])

  const status: PageTagsStatus = pageId === loadedForId ? 'ready' : 'loading'

  return { tags, status }
}
