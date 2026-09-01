import { useMemo } from 'react'
import { usePageTree } from '#hooks/usePageTree'
import { findPathToNode } from '#utils/page-tree'
import type { PageTreeNode } from '#api/pages'

export function usePageAncestors(parentId: string | null): PageTreeNode[] {
  const { tree } = usePageTree()

  return useMemo(() => {
    if (!parentId) {
      return []
    }
    return findPathToNode(tree, (node) => node.id === parentId) ?? []
  }, [tree, parentId])
}
