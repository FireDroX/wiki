import { useMemo, useState } from 'react'
import { useParams } from 'react-router'
import { usePageTree } from '#hooks/usePageTree'
import { PageTreeItem } from '#components/layout/PageTreeItem'
import { filterTree, findPathToNode } from '#utils/page-tree'

interface PageTreeProps {
  filter?: string
}

export function PageTree({ filter = '' }: PageTreeProps) {
  const params = useParams()
  const slug = params['*']?.split('/').filter(Boolean).pop()
  const { tree, status } = usePageTree()
  const [overrides, setOverrides] = useState<Map<string, boolean>>(new Map())
  const isFiltering = filter.trim().length > 0
  const visibleTree = useMemo(() => filterTree(tree, filter), [tree, filter])

  const ancestorIds = useMemo(() => {
    if (!slug) {
      return []
    }
    const path = findPathToNode(tree, (node) => node.slug === slug)
    return path?.map((node) => node.id) ?? []
  }, [tree, slug])

  function isExpanded(id: string): boolean {
    if (isFiltering) {
      return true
    }
    return overrides.get(id) ?? ancestorIds.includes(id)
  }

  function toggle(id: string) {
    setOverrides((current) => {
      const next = new Map(current)
      next.set(id, !isExpanded(id))
      return next
    })
  }

  if (status === 'loading') {
    return null
  }

  if (status === 'error') {
    return <p className="px-2.5 py-1.5 text-sm text-destructive">Impossible de charger les pages.</p>
  }

  if (isFiltering && visibleTree.length === 0) {
    return <p className="px-2.5 py-1.5 text-sm text-muted-foreground">Aucune page ne correspond.</p>
  }

  return (
    <div className="flex flex-col gap-0.5">
      {visibleTree.map((node) => (
        <PageTreeItem
          key={node.id}
          node={node}
          parentPath={[]}
          activeSlug={slug}
          isExpanded={isExpanded}
          onToggle={toggle}
        />
      ))}
    </div>
  )
}
