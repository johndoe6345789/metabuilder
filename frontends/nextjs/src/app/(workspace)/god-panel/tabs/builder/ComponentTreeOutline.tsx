'use client'

import type { TreeNode } from './builder-registry'
import { paletteItem } from './builder-registry'
import s from './ComponentTreeTab.module.scss'

type Props = {
  node: TreeNode
  depth: number
  selectedId: string
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onMove: (dragId: string, targetId: string) => void
}

export function ComponentTreeOutline({
  node,
  depth,
  selectedId,
  onSelect,
  onDelete,
  onMove,
}: Props) {
  const item = paletteItem(node.type)
  return (
    <>
      <div
        className={`${s.row} ${node.id === selectedId ? s.rowActive : ''}`}
        style={{ paddingLeft: 8 + depth * 16 }}
        draggable={node.id !== 'root'}
        onClick={() => {
          onSelect(node.id)
        }}
        onDragStart={event => {
          event.dataTransfer.setData('text/node-id', node.id)
        }}
        onDragOver={event => {
          event.preventDefault()
        }}
        onDrop={event => {
          event.preventDefault()
          const dragId = event.dataTransfer.getData('text/node-id')
          if (dragId) onMove(dragId, node.id)
        }}
      >
        <span className={s.grip}>⠿</span>
        <span className="material-symbols-rounded">
          {item?.icon ?? 'widgets'}
        </span>
        <span className={s.rowName}>{item?.name ?? node.type}</span>
        {node.id !== 'root' && (
          <button
            className={s.del}
            onClick={event => {
              event.stopPropagation()
              onDelete(node.id)
            }}
          >
            ✕
          </button>
        )}
      </div>
      {node.children.map(child => (
        <ComponentTreeOutline
          key={child.id}
          node={child}
          depth={depth + 1}
          selectedId={selectedId}
          onSelect={onSelect}
          onDelete={onDelete}
          onMove={onMove}
        />
      ))}
    </>
  )
}
