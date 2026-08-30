'use client'

import { Button, TextField } from '@/m3'
import type { CssClass } from '../use-css-classes'
import s from '../CssClassesTab.module.scss'

export interface ClassListPanelProps {
  classes: CssClass[]
  selectedId: string | undefined
  newName: string
  onNewNameChange: (name: string) => void
  onAdd: () => void
  onSelect: (id: string) => void
  onRemove: (id: string) => void
}

export function ClassListPanel({
  classes,
  selectedId,
  newName,
  onNewNameChange,
  onAdd,
  onSelect,
  onRemove,
}: ClassListPanelProps) {
  return (
    <aside className={s.list}>
      <div className={s.addRow}>
        <TextField
          size="small"
          label="New style"
          placeholder="Big red heading"
          value={newName}
          onChange={e => {
            onNewNameChange(e.target.value)
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') onAdd()
          }}
        />
        <Button size="small" variant="contained" onClick={onAdd}>
          +
        </Button>
      </div>
      {classes.map(c => (
        <div
          key={c.id}
          className={`${s.item} ${c.id === selectedId ? s.active : ''}`}
          onClick={() => {
            onSelect(c.id)
          }}
        >
          <span className={s.dotClass}>{c.name}</span>
          <button
            className={s.del}
            onClick={e => {
              e.stopPropagation()
              onRemove(c.id)
            }}
          >
            ✕
          </button>
        </div>
      ))}
    </aside>
  )
}
