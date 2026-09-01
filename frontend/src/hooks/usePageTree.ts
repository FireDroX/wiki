import { useEffect, useState } from 'react'
import { getTree } from '#api/pages'
import type { PageTreeNode } from '#api/pages'

export type PageTreeStatus = 'loading' | 'success' | 'error'

export interface UsePageTreeResult {
  tree: PageTreeNode[]
  status: PageTreeStatus
}

export function usePageTree(): UsePageTreeResult {
  const [tree, setTree] = useState<PageTreeNode[]>([])
  const [status, setStatus] = useState<PageTreeStatus>('loading')

  useEffect(() => {
    getTree()
      .then((nodes) => {
        setTree(nodes)
        setStatus('success')
      })
      .catch(() => {
        setStatus('error')
      })
  }, [])

  return { tree, status }
}
