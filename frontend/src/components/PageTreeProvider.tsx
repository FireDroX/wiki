import { useEffect, useState, type ReactNode } from 'react'
import { getTree } from '#api/pages'
import type { PageTreeNode } from '#api/pages'
import { PageTreeContext, type PageTreeStatus } from '#hooks/usePageTree'

export function PageTreeProvider({ children }: { children: ReactNode }) {
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

  return <PageTreeContext.Provider value={{ tree, status }}>{children}</PageTreeContext.Provider>
}
