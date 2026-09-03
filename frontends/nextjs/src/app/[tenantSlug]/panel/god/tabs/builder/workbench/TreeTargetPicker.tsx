'use client'

import type { TreeNode } from '../builder-registry'
import { paletteItem } from '../builder-registry'
import s from '../ComponentTreeTab.module.scss'

type Props = {
  node: TreeNode
  depth?: number
  pickedId: string
  onPick: (id: string) => void
}

/**
 * A read-only, fully-expanded tree list for choosing where a new block
 * goes -- not the real outline (no drag, no delete, no collapsing): the
 * only thing an author does here is pick one row.
 */
export function TreeTargetPicker({ node, depth = 0, pickedId, onPick }: Props) {
  const item = paletteItem(node.type)
  const rowClass = [s.row, node.id === pickedId ? s.rowActive : '']
    .filter(Boolean)
    .join(' ')

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        className={rowClass}
        style={{ paddingLeft: 8 + depth * 16 }}
        onClick={() => {
          onPick(node.id)
        }}
        onKeyDown={event => {
          if (event.key === 'Enter' || event.key === ' ') onPick(node.id)
        }}
      >
        <span className="material-symbols-rounded">
          {item?.icon ?? 'widgets'}
        </span>
        <span className={s.rowName}>{item?.name ?? node.type}</span>
      </div>
      {node.children.map(child => (
        <TreeTargetPicker
          key={child.id}
          node={child}
          depth={depth + 1}
          pickedId={pickedId}
          onPick={onPick}
        />
      ))}
    </div>
  )
}
