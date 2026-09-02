'use client'

import { useState } from 'react'
import { TextField, Typography } from '@/m3'
import { PALETTE, type PaletteItem } from '../builder-registry'
import { CATEGORIES } from '../component-tree-categories'
import { filterPalette } from '../palette-filter'
import { PaletteItemButton } from './PaletteItemButton'
import s from '../ComponentTreeTab.module.scss'

/** Draggable node types: a quick-add search across all of them, or the
 *  full list grouped by category when nothing is typed. Every insertion
 *  used to mean scrolling a 37-item categorized list by eye -- this lets
 *  a name be typed instead. */
export function PalettePane({ onAdd }: { onAdd: (type: string) => void }) {
  const [query, setQuery] = useState('')
  const matches = filterPalette(PALETTE, query)

  return (
    <aside className={s.palette}>
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
              <PaletteItemButton key={i.type} item={i} onAdd={onAdd} />
            ))
          )}
        </div>
      ) : (
        CATEGORIES.map(cat => (
          <div key={cat} className={s.palGroup}>
            <div className={s.palTitle}>{cat}</div>
            {PALETTE.filter((i: PaletteItem) => i.category === cat).map(i => (
              <PaletteItemButton key={i.type} item={i} onAdd={onAdd} />
            ))}
          </div>
        ))
      )}
    </aside>
  )
}
