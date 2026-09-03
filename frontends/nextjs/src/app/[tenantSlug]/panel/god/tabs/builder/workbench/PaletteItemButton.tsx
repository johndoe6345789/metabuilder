'use client'

import type { PaletteItem } from '../builder-registry'
import { PALETTE_MIME } from '../ComponentTreeOutline'
import s from '../ComponentTreeTab.module.scss'

/**
 * One draggable, clickable block-type entry -- shared by the grouped and
 * the filtered views so they stay in sync.
 *
 * A click stages the choice rather than inserting it: placement always
 * comes from an explicit step afterward (the Add dialog, or dragging this
 * same element onto a specific tree row), never a guess at where the
 * currently-selected node implies it should go.
 */
export function PaletteItemButton({
  item,
  selected,
  onSelect,
}: {
  item: PaletteItem
  selected: boolean
  onSelect: (type: string) => void
}) {
  return (
    <button
      className={[s.palItem, selected ? s.palItemSelected : '']
        .filter(Boolean)
        .join(' ')}
      draggable
      aria-pressed={selected}
      onDragStart={event => {
        event.dataTransfer.setData(PALETTE_MIME, item.type)
        event.dataTransfer.effectAllowed = 'copy'
      }}
      onClick={() => {
        onSelect(item.type)
      }}
    >
      <span className="material-symbols-rounded">{item.icon}</span>
      {item.name}
    </button>
  )
}
