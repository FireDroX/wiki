import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { getTree } from '#api/pages'
import type { PageTreeNode } from '#api/pages'
import { PageTreeContext, type PageTreeStatus } from '#hooks/usePageTree'

export function PageTreeProvider({ children }: { children: ReactNode }) {
  const [tree, setTree] = useState<PageTreeNode[]>([])
  const [status, setStatus] = useState<PageTreeStatus>('loading')

  const refresh = useCallback(async () => {
    try {
      const nodes = await getTree()
      setTree(nodes)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return <PageTreeContext.Provider value={{ tree, status, refresh }}>{children}</PageTreeContext.Provider>
}
