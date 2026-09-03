import { useEffect, useState } from 'react'
import { search, type SearchResult } from '#api/search'

export type SearchResultsStatus = 'idle' | 'loading' | 'success' | 'error'

export interface UseSearchResultsResult {
  status: SearchResultsStatus
  items: SearchResult[]
  total: number
}

export const SEARCH_RESULTS_LIMIT = 20
const MIN_QUERY_LENGTH = 2

export function useSearchResults(q: string, page: number): UseSearchResultsResult {
  const [status, setStatus] = useState<SearchResultsStatus>('idle')
  const [items, setItems] = useState<SearchResult[]>([])
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const trimmed = q.trim()
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setStatus('idle')
      setItems([])
      setTotal(0)
      return
    }

    let cancelled = false
    setStatus('loading')

    search(trimmed, page, SEARCH_RESULTS_LIMIT)
      .then((response) => {
        if (cancelled) return
        setItems(response.results)
        setTotal(response.total)
        setStatus('success')
      })
      .catch(() => {
        if (cancelled) return
        setItems([])
        setTotal(0)
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [q, page])

  return { status, items, total }
}
