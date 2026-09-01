import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '#components/ui/collapsible'
import { cn } from '#lib/utils'
import type { PageTreeNode } from '#api/pages'

interface PageTreeItemProps {
  node: PageTreeNode
  parentPath: string[]
  activeSlug?: string
  isExpanded: (id: string) => boolean
  onToggle: (id: string) => void
}

export function PageTreeItem({ node, parentPath, activeSlug, isExpanded, onToggle }: PageTreeItemProps) {
  const isActive = node.slug === activeSlug
  const hasChildren = node.children.length > 0
  const fullPath = [...parentPath, node.slug]

  const link = (
    <Link
      to={`/pages/${fullPath.join('/')}`}
      className={cn(
        'flex-1 truncate rounded-md px-2 py-1.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        isActive && 'bg-sidebar-accent font-medium text-sidebar-accent-foreground',
      )}
    >
      {node.title}
    </Link>
  )

  if (!hasChildren) {
    return <div className="flex pl-2">{link}</div>
  }

  const expanded = isExpanded(node.id)

  return (
    <Collapsible open={expanded} onOpenChange={() => onToggle(node.id)}>
      <div className="flex items-center gap-0.5 pl-2">
        <CollapsibleTrigger className="rounded-md p-1 text-sidebar-foreground hover:bg-sidebar-accent">
          <ChevronRight className={cn('size-4 transition-transform', expanded && 'rotate-90')} />
          <span className="sr-only">Basculer {node.title}</span>
        </CollapsibleTrigger>
        {link}
      </div>
      <CollapsibleContent className="ml-3 flex flex-col gap-0.5 border-l border-sidebar-border pl-2">
        {node.children.map((child) => (
          <PageTreeItem
            key={child.id}
            node={child}
            parentPath={fullPath}
            activeSlug={activeSlug}
            isExpanded={isExpanded}
            onToggle={onToggle}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}
