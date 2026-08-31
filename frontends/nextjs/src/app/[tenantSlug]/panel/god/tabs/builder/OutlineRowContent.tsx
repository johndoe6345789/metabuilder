'use client'

import type { TreeNode } from './builder-registry'
import { paletteItem } from './builder-registry'
import s from './ComponentTreeTab.module.scss'

export interface OutlineRowContentProps {
  node: TreeNode
  hasChildren: boolean
  isCollapsed: boolean
  onToggleCollapse: (id: string) => void
  onDelete: (id: string) => void
}

/** The twisty, icon, name, node-id badge, child count, and delete button
 *  inside one outline row -- split out so ComponentTreeOutline only owns
 *  the row's drag/drop wrapper and its recursion. */
export function OutlineRowContent({
  node,
  hasChildren,
  isCollapsed,
  onToggleCollapse,
  onDelete,
}: OutlineRowContentProps) {
  const item = paletteItem(node.type)

  return (
    <>
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
    </>
  )
}
