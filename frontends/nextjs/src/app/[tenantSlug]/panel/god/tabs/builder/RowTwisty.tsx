'use client'

import s from './ComponentTreeTab.module.scss'

export interface RowTwistyProps {
  id: string
  hasChildren: boolean
  isCollapsed: boolean
  onToggleCollapse: (id: string) => void
}

/** The expand/collapse control at the start of a row. Always occupies its
 *  slot so rows with and without children keep the same text alignment. */
export function RowTwisty({
  id,
  hasChildren,
  isCollapsed,
  onToggleCollapse,
}: RowTwistyProps) {
  return (
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
        if (hasChildren) onToggleCollapse(id)
      }}
    >
      {/* One glyph rotated by state rather than two characters: the text
          triangles rendered at wildly different sizes across platforms,
          and a single rotating chevron matches the icon set the rest of
          the row already uses. */}
      <span
        className={`material-symbols-rounded ${s.twistyIcon}`}
        aria-hidden="true"
      >
        chevron_right
      </span>
    </button>
  )
}
