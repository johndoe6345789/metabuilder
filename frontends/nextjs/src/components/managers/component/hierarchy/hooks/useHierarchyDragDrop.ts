import type React from 'react'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { componentCatalog } from '@/lib/components/component-catalog'
import { Database, ComponentNode } from '@/lib/database'

type DragDropOptions = {
  hierarchy: Record<string, ComponentNode>
  setExpandedNodes: React.Dispatch<React.SetStateAction<Set<string>>>
  loadHierarchy: () => Promise<void>
}

type DragDropHandlers = {
  draggingNodeId: string | null
  handleDragStart: (nodeId: string) => void
  handleDragOver: (event: React.DragEvent, nodeId: string) => void
  handleDrop: (event: React.DragEvent, targetNodeId: string) => Promise<void>
}

export function useHierarchyDragDrop({ hierarchy, setExpandedNodes, loadHierarchy }: DragDropOptions): DragDropHandlers {
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null)

  const handleDragStart = useCallback((nodeId: string) => {
    setDraggingNodeId(nodeId)
  }, [])

  const handleDragOver = useCallback((event: React.DragEvent, _nodeId: string) => {
    event.preventDefault()
    event.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    async (event: React.DragEvent, targetNodeId: string) => {
      event.preventDefault()
      event.stopPropagation()

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
    [draggingNodeId, hierarchy, loadHierarchy, setExpandedNodes]
  )

  return {
    draggingNodeId,
    handleDragStart,
    handleDragOver,
    handleDrop,
  }
}
