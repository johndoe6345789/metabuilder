'use client'

import { PALETTE, type PaletteItem } from '../builder-registry'
import { CATEGORIES } from '../component-tree-categories'
import { PALETTE_MIME } from '../ComponentTreeOutline'
import s from '../ComponentTreeTab.module.scss'

/** Draggable node types, grouped by category. */
export function PalettePane({ onAdd }: { onAdd: (type: string) => void }) {
  return (
    <aside className={s.palette}>
      {CATEGORIES.map(cat => (
        <div key={cat} className={s.palGroup}>
          <div className={s.palTitle}>{cat}</div>
          {PALETTE.filter((i: PaletteItem) => i.category === cat).map(i => (
            <button
              key={i.type}
              className={s.palItem}
              draggable
              onDragStart={event => {
                event.dataTransfer.setData(PALETTE_MIME, i.type)
                event.dataTransfer.effectAllowed = 'copy'
              }}
              onClick={() => {
                onAdd(i.type)
              }}
            >
              <span className="material-symbols-rounded">{i.icon}</span>
              {i.name}
            </button>
          ))}
        </div>
      ))}
    </aside>
  )
}
