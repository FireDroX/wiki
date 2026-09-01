import { useMemo, useState } from 'react'
import { useParams } from 'react-router'
import { usePageTree } from '#hooks/usePageTree'
import { PageTreeItem } from '#components/layout/PageTreeItem'
import { findPathToNode } from '#utils/page-tree'

export function PageTree() {
  const { slug } = useParams<{ slug?: string }>()
  const { tree, status } = usePageTree()
  const [overrides, setOverrides] = useState<Map<string, boolean>>(new Map())

  const ancestorIds = useMemo(() => {
    if (!slug) {
      return []
    }
    const path = findPathToNode(tree, (node) => node.slug === slug)
    return path?.map((node) => node.id) ?? []
  }, [tree, slug])

  function isExpanded(id: string): boolean {
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

  return (
    <div className="flex flex-col gap-0.5">
      {tree.map((node) => (
        <PageTreeItem key={node.id} node={node} activeSlug={slug} isExpanded={isExpanded} onToggle={toggle} />
      ))}
    </div>
  )
}
