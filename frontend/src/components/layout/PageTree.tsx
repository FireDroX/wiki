import { useMemo, useState } from 'react'
import { useParams } from 'react-router'
import { usePageTree } from '#hooks/usePageTree'
import { PageTreeItem } from '#components/layout/PageTreeItem'
import type { PageTreeNode } from '#api/pages'

function findAncestorIds(nodes: PageTreeNode[], slug: string): string[] | null {
  for (const node of nodes) {
    if (node.slug === slug) {
      return [node.id]
    }
    const childPath = findAncestorIds(node.children, slug)
    if (childPath) {
      return [node.id, ...childPath]
    }
  }
  return null
}

export function PageTree() {
  const { slug } = useParams<{ slug?: string }>()
  const { tree, status } = usePageTree()
  const [overrides, setOverrides] = useState<Map<string, boolean>>(new Map())

  const ancestorIds = useMemo(() => (slug ? (findAncestorIds(tree, slug) ?? []) : []), [tree, slug])

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
