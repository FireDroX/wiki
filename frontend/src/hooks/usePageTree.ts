import { createContext, useContext } from 'react'
import type { PageTreeNode } from '#api/pages'

export type PageTreeStatus = 'loading' | 'success' | 'error'

export interface PageTreeContextValue {
  tree: PageTreeNode[]
  status: PageTreeStatus
}

export const PageTreeContext = createContext<PageTreeContextValue | null>(null)

export function usePageTree(): PageTreeContextValue {
  const context = useContext(PageTreeContext)
  if (!context) {
    throw new Error('usePageTree must be used within a PageTreeProvider')
  }
  return context
}
