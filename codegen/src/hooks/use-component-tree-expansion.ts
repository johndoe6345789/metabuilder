import { useCallback, useMemo, useState } from 'react'
import { UIComponent } from '@/types/json-ui'

interface ComponentTreeExpansionState {
  expandedIds: Set<string>
  handleExpandAll: () => void
  handleCollapseAll: () => void
  toggleExpand: (id: string) => void
}

const getExpandableIds = (components: UIComponent[]): string[] => {
  const ids: string[] = []
  const traverse = (nodes: UIComponent[]) => {
    nodes.forEach((component) => {
      if (Array.isArray(component.children) && component.children.length > 0) {
        ids.push(component.id)
        traverse(component.children)
      }
    })
  }
  traverse(components)
  return ids
}

export function useComponentTreeExpansion(
  components: UIComponent[],
): ComponentTreeExpansionState {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const expandableIds = useMemo(() => getExpandableIds(components), [components])

  const handleExpandAll = useCallback(() => {
    setExpandedIds(new Set(expandableIds))
  }, [expandableIds])

  const handleCollapseAll = useCallback(() => {
    setExpandedIds(new Set())
  }, [])

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  return {
    expandedIds,
    handleExpandAll,
    handleCollapseAll,
    toggleExpand,
  }
}
