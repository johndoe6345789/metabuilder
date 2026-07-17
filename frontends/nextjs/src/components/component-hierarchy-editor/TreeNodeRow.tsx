'use client'

import { IconButton, Typography, Chip } from '@/m3'
import s from './TreeNode.module.scss'

type Props = {
  type: string
  depth: number
  childCount: number
  isExpanded: boolean
  isSelected: boolean
  isDragging: boolean
  isOver: boolean
  onRowClick: () => void
  onCaretClick: (e: React.MouseEvent) => void
  onConfig: (e: React.MouseEvent) => void
  onRemove: (e: React.MouseEvent) => void
  onDragStart: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent) => void
}

export function TreeNodeRow({
  type, depth, childCount, isExpanded, isSelected,
  isDragging, isOver, onRowClick, onCaretClick,
  onConfig, onRemove, onDragStart, onDragOver, onDragLeave, onDrop,
}: Props) {
  const rowClass = [
    s.row,
    isSelected ? s.selected : '',
    isDragging ? s.dragging : '',
    isOver ? s.dropOver : '',
  ].filter(Boolean).join(' ')

  return (
    <div
      className={rowClass}
      style={{ paddingLeft: `${depth * 16 + 8}px` }}
      onClick={onRowClick}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <button
        type="button"
        className={s.caret}
        aria-label={isExpanded ? 'Collapse' : 'Expand'}
        onClick={onCaretClick}
      >
        {childCount > 0 ? (isExpanded ? '▼' : '▶') : ' '}
      </button>

      <Typography variant="body2" className={s.label}>{type}</Typography>

      {childCount > 0 && (
        <Chip label={String(childCount)} size="small" />
      )}

      <div className={s.actions}>
        <IconButton
          size="small"
          aria-label="Configure"
          onClick={onConfig}
        >
          ⚙
        </IconButton>
        <IconButton
          size="small"
          aria-label="Delete"
          onClick={onRemove}
        >
          🗑
        </IconButton>
      </div>
    </div>
  )
}
