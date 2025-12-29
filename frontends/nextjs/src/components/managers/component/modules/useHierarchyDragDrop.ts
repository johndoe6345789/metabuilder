import type React from 'react'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

import { componentCatalog } from '@/lib/components/component-catalog'
import { type ComponentNode,Database } from '@/lib/database'

interface UseHierarchyDragDropProps {
  hierarchy: Record<string, ComponentNode>
  loadHierarchy: () => Promise<void>
}

export function useHierarchyDragDrop({ hierarchy, loadHierarchy }: UseHierarchyDragDropProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null)

  const handleToggleNode = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev)
      if (next.has(nodeId)) {
        next.delete(nodeId)
      } else {
        next.add(nodeId)
      }
      return next
    })
  }, [])

  const handleExpandAll = useCallback(() => {
    setExpandedNodes(new Set(Object.keys(hierarchy)))
  }, [hierarchy])

  const handleCollapseAll = useCallback(() => {
    setExpandedNodes(new Set())
  }, [])

  const handleDragStart = useCallback((nodeId: string) => {
    setDraggingNodeId(nodeId)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, nodeId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setExpandedNodes(prev => new Set([...prev, nodeId]))
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent, targetNodeId: string) => {
      e.preventDefault()
      e.stopPropagation()

      if (!draggingNodeId || draggingNodeId === targetNodeId) {
        setDraggingNodeId(null)
        return
      }

      const draggedNode = hierarchy[draggingNodeId]
      const targetNode = hierarchy[targetNodeId]

      if (!draggedNode || !targetNode) {
        setDraggingNodeId(null)
        return
      }

      if (targetNode.childIds.includes(draggingNodeId)) {
        setDraggingNodeId(null)
        return
      }

      const componentDef = componentCatalog.find(c => c.type === targetNode.type)
      if (!componentDef?.allowsChildren) {
        toast.error(`${targetNode.type} cannot contain children`)
        setDraggingNodeId(null)
        return
      }

      if (draggedNode.parentId) {
        const oldParent = hierarchy[draggedNode.parentId]
        await Database.updateComponentNode(draggedNode.parentId, {
          childIds: oldParent.childIds.filter(id => id !== draggingNodeId),
        })
      }

      await Database.updateComponentNode(targetNodeId, {
        childIds: [...targetNode.childIds, draggingNodeId],
      })

      await Database.updateComponentNode(draggingNodeId, {
        parentId: targetNodeId,
        order: targetNode.childIds.length,
      })

      setDraggingNodeId(null)
      setExpandedNodes(prev => new Set([...prev, targetNodeId]))
      await loadHierarchy()
      toast.success('Component moved')
    },
    [draggingNodeId, hierarchy, loadHierarchy]
  )

  const expandNode = useCallback((nodeId?: string | null) => {
    if (!nodeId) return
    setExpandedNodes(prev => new Set([...prev, nodeId]))
  }, [])

  return {
    selectedNodeId,
    setSelectedNodeId,
    expandedNodes,
    draggingNodeId,
    handleToggleNode,
    handleExpandAll,
    handleCollapseAll,
    handleDragStart,
    handleDragOver,
    handleDrop,
    expandNode,
  }
}
