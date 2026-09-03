import { useEffect, useState } from 'react'
import { search, type SearchResult } from '#api/search'

export type DebouncedSearchStatus = 'idle' | 'loading' | 'success' | 'error'

export interface UseDebouncedSearchResult {
  status: DebouncedSearchStatus
  results: SearchResult[]
  total: number
}

const DEBOUNCE_MS = 300
const MIN_QUERY_LENGTH = 2

export function useDebouncedSearch(query: string, limit = 8): UseDebouncedSearchResult {
  const [status, setStatus] = useState<DebouncedSearchStatus>('idle')
  const [results, setResults] = useState<SearchResult[]>([])
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setStatus('idle')
      setResults([])
      setTotal(0)
      return
    }

    let cancelled = false
    setStatus('loading')

    const timeout = setTimeout(() => {
      search(trimmed, 1, limit)
        .then((response) => {
          if (cancelled) return
          setResults(response.results)
          setTotal(response.total)
          setStatus('success')
        })
        .catch(() => {
          if (cancelled) return
          setResults([])
          setTotal(0)
          setStatus('error')
        })
    }, DEBOUNCE_MS)

    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [query, limit])

  return { status, results, total }
}
