'use client'

import type { PaletteItem } from '../builder-registry'
import { PALETTE_MIME } from '../ComponentTreeOutline'
import s from '../ComponentTreeTab.module.scss'

/** One draggable, clickable block-type entry -- shared by the grouped and
 *  the filtered views so they stay in sync. */
export function PaletteItemButton({
  item,
  onAdd,
}: {
  item: PaletteItem
  onAdd: (type: string) => void
}) {
  return (
    <button
      className={s.palItem}
      draggable
      onDragStart={event => {
        event.dataTransfer.setData(PALETTE_MIME, item.type)
        event.dataTransfer.effectAllowed = 'copy'
      }}
      onClick={() => {
        onAdd(item.type)
      }}
    >
      <span className="material-symbols-rounded">{item.icon}</span>
      {item.name}
    </button>
  )
}
