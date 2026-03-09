import { useState, useCallback, useRef } from 'react'

export interface DragItem {
  id: string
  type: string
  data: any
}

export interface DropPosition {
  targetId: string
  position: 'before' | 'after' | 'inside'
}

export function useDragDrop() {
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
