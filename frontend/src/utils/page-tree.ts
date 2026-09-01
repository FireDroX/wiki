import type { PageTreeNode } from '#api/pages'

export function filterTree(nodes: PageTreeNode[], query: string): PageTreeNode[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) {
    return nodes
  }

  return nodes.reduce<PageTreeNode[]>((result, node) => {
    const children = filterTree(node.children, query)
    const matches = node.title.toLowerCase().includes(normalized)
    if (matches || children.length > 0) {
      result.push({ ...node, children })
    }
    return result
  }, [])
}

export function findPathToNode(
  nodes: PageTreeNode[],
  predicate: (node: PageTreeNode) => boolean,
): PageTreeNode[] | null {
  for (const node of nodes) {
    if (predicate(node)) {
      return [node]
    }
    const childPath = findPathToNode(node.children, predicate)
    if (childPath) {
      return [node, ...childPath]
    }
  }
  return null
}
