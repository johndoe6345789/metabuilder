/**
 * useDragDrop Hook
 * Drag and drop state management with position detection
 *
 * @example
 * const dnd = useDragDrop()
 *
 * <div
 *   draggable
 *   onDragStart={(e) => dnd.handleDragStart({ id: '1', type: 'item', data: item }, e)}
 *   onDragEnd={dnd.handleDragEnd}
 * >
 *   Draggable Item
 * </div>
 *
 * <div
 *   onDragOver={(e) => dnd.handleDragOver('target-1', e)}
 *   onDragLeave={dnd.handleDragLeave}
 *   onDrop={(e) => dnd.handleDrop('target-1', e, (item, position) => {
 *     console.log('Dropped:', item, 'at', position)
 *   })}
 * >
 *   Drop Target
 * </div>
 */

import { useState, useCallback, useRef } from 'react'

export interface DragItem {
  /** Unique identifier for the dragged item */
  id: string
  /** Type of the dragged item (for filtering valid drops) */
  type: string
  /** Any additional data attached to the item */
  data: any
}

export interface DropPosition {
  /** ID of the drop target */
  targetId: string
  /** Position relative to the target: before, after, or inside */
  position: 'before' | 'after' | 'inside'
}

export interface UseDragDropReturn {
  /** Currently dragged item, or null if nothing is being dragged */
  draggedItem: DragItem | null
  /** Current drop target ID, or null if not over a target */
  dropTarget: string | null
  /** Current drop position relative to target */
  dropPosition: 'before' | 'after' | 'inside' | null
  /** Start dragging an item */
  handleDragStart: (item: DragItem, e: React.DragEvent) => void
  /** End drag operation */
  handleDragEnd: () => void
  /** Handle drag over a potential drop target */
  handleDragOver: (targetId: string, e: React.DragEvent) => void
  /** Handle drag leaving a target */
  handleDragLeave: (e: React.DragEvent) => void
  /** Handle drop on a target */
  handleDrop: (targetId: string, e: React.DragEvent, onDrop?: (item: DragItem, target: DropPosition) => void) => void
}

/**
 * Hook for managing drag and drop operations with position detection
 * @returns Object containing drag state and event handlers
 */
export function useDragDrop(): UseDragDropReturn {
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null)
  const [dropTarget, setDropTarget] = useState<string | null>(null)
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | 'inside' | null>(null)
  const dragStartPos = useRef<{ x: number; y: number } | null>(null)

  const handleDragStart = useCallback((item: DragItem, e: React.DragEvent) => {
    setDraggedItem(item)
    dragStartPos.current = { x: e.clientX, y: e.clientY }
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', JSON.stringify(item))
  }, [])

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null)
    setDropTarget(null)
    setDropPosition(null)
    dragStartPos.current = null
  }, [])

  const handleDragOver = useCallback((targetId: string, e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top
    const height = rect.height

    let position: 'before' | 'after' | 'inside' = 'inside'

    if (y < height * 0.25) {
      position = 'before'
    } else if (y > height * 0.75) {
      position = 'after'
    }

    setDropTarget(targetId)
    setDropPosition(position)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    const related = e.relatedTarget as HTMLElement
    if (!related || !e.currentTarget.contains(related)) {
      setDropTarget(null)
      setDropPosition(null)
    }
  }, [])

  const handleDrop = useCallback((targetId: string, e: React.DragEvent, onDrop?: (item: DragItem, target: DropPosition) => void) => {
    e.preventDefault()
    e.stopPropagation()

    if (draggedItem && onDrop) {
      onDrop(draggedItem, {
        targetId,
        position: dropPosition || 'inside',
      })
    }

    handleDragEnd()
  }, [draggedItem, dropPosition, handleDragEnd])

  return {
    draggedItem,
    dropTarget,
    dropPosition,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  }
}
