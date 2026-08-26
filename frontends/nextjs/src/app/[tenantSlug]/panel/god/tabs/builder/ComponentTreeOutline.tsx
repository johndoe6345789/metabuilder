'use client'

import { useState } from 'react'
import type { TreeNode } from './builder-registry'
import { paletteItem } from './builder-registry'
import { dropWhere, type DropWhere } from './component-tree-drop'
import s from './ComponentTreeTab.module.scss'

/** Drag payloads. A row carries a node id; a palette entry carries a type. */
export const NODE_MIME = 'text/node-id'
export const PALETTE_MIME = 'text/palette-type'

type Props = {
  node: TreeNode
  depth: number
  selectedId: string
  collapsed: ReadonlySet<string>
  onToggleCollapse: (id: string) => void
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onMove: (dragId: string, targetId: string, where: DropWhere) => void
  onAdd: (type: string, parentId: string) => void
}

export function ComponentTreeOutline({
  node,
  depth,
  selectedId,
  collapsed,
  onToggleCollapse,
  onSelect,
  onDelete,
  onMove,
  onAdd,
}: Props) {
  const [dropping, setDropping] = useState<DropWhere | null>(null)
  const item = paletteItem(node.type)
  const hasChildren = node.children.length > 0
  const isCollapsed = collapsed.has(node.id)

  return (
    <>
      <div
        className={[
          s.row,
          node.id === selectedId ? s.rowActive : '',
          dropping === 'into' ? s.rowDropping : '',
          dropping === 'before' ? s.rowDropBefore : '',
          dropping === 'after' ? s.rowDropAfter : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={{ paddingLeft: 8 + depth * 16 }}
        draggable={node.id !== 'root'}
        onClick={() => {
          onSelect(node.id)
        }}
        onDragStart={event => {
          event.dataTransfer.setData(NODE_MIME, node.id)
          event.dataTransfer.effectAllowed = 'copyMove'
        }}
        onDragOver={event => {
          // Without preventDefault the browser refuses the drop outright.
          event.preventDefault()
          // The root has no siblings to sit between, so it is only ever a
          // container to drop into.
          setDropping(node.id === 'root' ? 'into' : dropWhere(event))
        }}
        onDragLeave={() => {
          setDropping(null)
        }}
        onDrop={event => {
          event.preventDefault()
          const where = dropping ?? 'into'
          setDropping(null)
          const paletteType = event.dataTransfer.getData(PALETTE_MIME)
          if (paletteType) {
            onAdd(paletteType, node.id)
            return
          }
          const dragId = event.dataTransfer.getData(NODE_MIME)
          if (dragId) onMove(dragId, node.id, where)
        }}
      >
        <button
          type="button"
          className={[
            s.twisty,
            hasChildren ? '' : s.twistyLeaf,
            hasChildren && !isCollapsed ? s.twistyOpen : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-label={isCollapsed ? 'Expand' : 'Collapse'}
          aria-expanded={hasChildren ? !isCollapsed : undefined}
          onClick={event => {
            event.stopPropagation()
            if (hasChildren) onToggleCollapse(node.id)
          }}
        >
          {/* One glyph rotated by state rather than two characters: the
              text triangles rendered at wildly different sizes across
              platforms, and a single rotating chevron matches the icon
              set the rest of the row already uses. */}
          <span
            className={`material-symbols-rounded ${s.twistyIcon}`}
            aria-hidden="true"
          >
            chevron_right
          </span>
        </button>
        <span className={s.grip}>⠿</span>
        <span className="material-symbols-rounded">
          {item?.icon ?? 'widgets'}
        </span>
        <span className={s.rowName}>{item?.name ?? node.type}</span>
        {typeof node.props.id === 'string' && node.props.id !== '' && (
          // Six identical "Div" rows are indistinguishable; the id the author
          // gave a node is how they actually think of it.
          <span className={s.rowId}>#{node.props.id}</span>
        )}
        {hasChildren && isCollapsed && (
          <span className={s.childCount}>{node.children.length}</span>
        )}
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
      {!isCollapsed &&
        node.children.map(child => (
          <ComponentTreeOutline
            key={child.id}
            node={child}
            depth={depth + 1}
            selectedId={selectedId}
            collapsed={collapsed}
            onToggleCollapse={onToggleCollapse}
            onSelect={onSelect}
            onDelete={onDelete}
            onMove={onMove}
            onAdd={onAdd}
          />
        ))}
    </>
  )
}
