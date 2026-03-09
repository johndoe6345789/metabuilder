import type { ComponentProps } from 'react'

export interface ComponentTreeNodeProps extends ComponentProps<'div'> {
  component?: any
  isSelected?: boolean
  isHovered?: boolean
  isDraggedOver?: boolean
  dropPosition?: 'before' | 'after' | 'inside' | null
  onSelect?: () => void
  onHover?: () => void
  onHoverEnd?: () => void
  onDragStart?: (e: React.DragEvent) => void
  onDragOver?: (e: React.DragEvent) => void
  onDragLeave?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent) => void
  depth?: number
  hasChildren?: boolean
  isExpanded?: boolean
  onToggleExpand?: () => void
}
