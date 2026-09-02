import { useCallback, useEffect, useState } from 'react'
import { listVersions, type VersionSummary } from '#api/versions'

export type VersionsStatus = 'loading' | 'success' | 'error'

export interface UseVersionsResult {
  status: VersionsStatus
  items: VersionSummary[]
  total: number
  page: number
  limit: number
  setPage: (page: number) => void
  refresh: () => void
}

const LIMIT = 20

export function useVersions(pageId: string | undefined): UseVersionsResult {
  const [status, setStatus] = useState<VersionsStatus>('loading')
  const [items, setItems] = useState<VersionSummary[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [reloadToken, setReloadToken] = useState(0)

  const refresh = useCallback(() => setReloadToken((token) => token + 1), [])

  useEffect(() => {
    if (!pageId) {
      return
    }

    let cancelled = false
    setStatus('loading')

    listVersions(pageId, page, LIMIT)
      .then((result) => {
        if (cancelled) return
        setItems(result.items)
        setTotal(result.total)
        setStatus('success')
      })
      .catch(() => {
        if (cancelled) return
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [pageId, page, reloadToken])

  return { status, items, total, page, limit: LIMIT, setPage, refresh }
}
