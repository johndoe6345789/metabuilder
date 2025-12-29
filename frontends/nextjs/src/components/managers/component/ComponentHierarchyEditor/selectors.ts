import type { ComponentNode } from '@/lib/database'

export function selectRootNodes(
  hierarchy: Record<string, ComponentNode>,
  selectedPageId: string | null
): ComponentNode[] {
  return Object.values(hierarchy)
    .filter(node => node.pageId === selectedPageId && !node.parentId)
    .sort((a, b) => a.order - b.order)
}
