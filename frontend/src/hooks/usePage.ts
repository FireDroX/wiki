import { useEffect, useState } from 'react'
import { isAxiosError } from 'axios'
import { getPageByPath, type PageDetail } from '#api/pages'

export type PageStatus = 'loading' | 'success' | 'notFound' | 'forbidden' | 'error'

export interface UsePageResult {
  status: PageStatus
  page: PageDetail | null
}

export function usePage(pathSegments: string[]): UsePageResult {
  const [status, setStatus] = useState<PageStatus>('loading')
  const [page, setPage] = useState<PageDetail | null>(null)
  const pathKey = pathSegments.join('/')

  useEffect(() => {
    if (!pathKey) {
      setStatus('notFound')
      setPage(null)
      return
    }

    let cancelled = false
    setStatus('loading')
    setPage(null)

    getPageByPath(pathKey.split('/'))
      .then((result) => {
        if (cancelled) return
        setPage(result)
        setStatus('success')
      })
      .catch((error: unknown) => {
        if (cancelled) return
        if (isAxiosError(error)) {
          if (error.response?.status === 404) {
            setStatus('notFound')
            return
          }
          if (error.response?.status === 403) {
            setStatus('forbidden')
            return
          }
        }
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [pathKey])

  return { status, page }
}
