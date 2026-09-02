'use client'

import type { TreeNode } from './builder-registry'
import { paletteItem } from './builder-registry'
import { DeleteRowButton } from './DeleteRowButton'
import { RowTwisty } from './RowTwisty'
import s from './ComponentTreeTab.module.scss'

export interface OutlineRowContentProps {
  node: TreeNode
  hasChildren: boolean
  isCollapsed: boolean
  draggable: boolean
  onToggleCollapse: (id: string) => void
  onDelete: (id: string) => void
  onDragStart: (event: React.DragEvent) => void
}

/** The twisty, icon, name, node-id badge, child count, and delete button
 *  inside one outline row -- split out so ComponentTreeOutline only owns
 *  the row's drag/drop wrapper and its recursion. */
export function OutlineRowContent({
  node,
  hasChildren,
  isCollapsed,
  draggable,
  onToggleCollapse,
  onDelete,
  onDragStart,
}: OutlineRowContentProps) {
  const item = paletteItem(node.type)

  return (
    <>
      <RowTwisty
        id={node.id}
        hasChildren={hasChildren}
        isCollapsed={isCollapsed}
        onToggleCollapse={onToggleCollapse}
      />
      {/* The only draggable element in the row: a click that drifts a few
          pixels used to start a drag from anywhere on the row, silently
          reordering or reparenting the wrong node. Reordering now has to
          start here, deliberately. */}
      <span
        className={s.grip}
        draggable={draggable}
        onDragStart={onDragStart}
        aria-hidden="true"
      >
        ⠿
      </span>
      <span className="material-symbols-rounded">{item?.icon ?? 'widgets'}</span>
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
        <DeleteRowButton
          id={node.id}
          name={item?.name ?? node.type}
          hasChildren={hasChildren}
          onDelete={onDelete}
        />
      )}
    </>
  )
}
