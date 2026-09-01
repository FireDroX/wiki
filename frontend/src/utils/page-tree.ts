import type { PageTreeNode } from '#api/pages'

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
