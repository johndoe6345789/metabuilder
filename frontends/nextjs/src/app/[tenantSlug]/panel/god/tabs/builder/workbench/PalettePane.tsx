'use client'

import { useState } from 'react'
import { TextField, Typography } from '@/m3'
import { PALETTE, paletteItem, type PaletteItem } from '../builder-registry'
import { CATEGORIES } from '../component-tree-categories'
import { filterPalette } from '../palette-filter'
import { PaletteItemButton } from './PaletteItemButton'
import { PaletteAddBar } from './PaletteAddBar'
import s from '../ComponentTreeTab.module.scss'

type Props = {
  pendingType: string | null
  onSelectType: (type: string) => void
  onRequestAdd: () => void
}

/**
 * Draggable, clickable node types: a quick-add search across all of them,
 * or the full list grouped by category when nothing is typed.
 *
 * Clicking a block only stages it (see use-pending-add.ts) -- the Add bar
 * below appears once one is staged, and placement itself happens in the
 * dialog it opens, or by dragging the block straight onto a tree row.
 */
export function PalettePane({
  pendingType,
  onSelectType,
  onRequestAdd,
}: Props) {
  const [query, setQuery] = useState('')
  const matches = filterPalette(PALETTE, query)
  const pendingItem =
    pendingType === null ? undefined : paletteItem(pendingType)

  return (
    <aside className={s.palette}>
      <div className={s.paletteScroll}>
        <div className={s.palGroup}>
          <TextField
            size="small"
            fullWidth
            placeholder="Find a block…"
            value={query}
            onChange={event => {
              setQuery(event.target.value)
            }}
          />
        </div>
        {query.trim() !== '' ? (
          <div className={s.palGroup}>
            {matches.length === 0 ? (
              <Typography variant="caption" className={s.propHint}>
                No block matches “{query.trim()}”.
              </Typography>
            ) : (
              matches.map(i => (
                <PaletteItemButton
                  key={i.type}
                  item={i}
                  selected={i.type === pendingType}
                  onSelect={onSelectType}
                />
              ))
            )}
          </div>
        ) : (
          CATEGORIES.map(cat => (
            <div key={cat} className={s.palGroup}>
              <div className={s.palTitle}>{cat}</div>
              {PALETTE.filter((i: PaletteItem) => i.category === cat).map(
                i => (
                  <PaletteItemButton
                    key={i.type}
                    item={i}
                    selected={i.type === pendingType}
                    onSelect={onSelectType}
                  />
                )
              )}
            </div>
          ))
        )}
      </div>
      {pendingItem !== undefined && (
        <PaletteAddBar item={pendingItem} onRequestAdd={onRequestAdd} />
      )}
    </aside>
  )
}
