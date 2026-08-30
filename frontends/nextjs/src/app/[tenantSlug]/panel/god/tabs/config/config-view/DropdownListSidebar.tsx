'use client'

import { Button, TextField } from '@/m3'
import type { DropdownConfig } from '../use-dropdown-configs'
import s from '../ConfigTab.module.scss'

export interface DropdownListSidebarProps {
  configs: DropdownConfig[]
  selectedId: string | undefined
  newListName: string
  onNewListNameChange: (value: string) => void
  onAddList: () => void
  onSelect: (id: string) => void
  onRemove: (id: string) => void
}

/** Every saved dropdown list, and the control to add one. */
export function DropdownListSidebar(props: DropdownListSidebarProps) {
  return (
    <aside className={s.list}>
      <div className={s.addRow}>
        <TextField
          size="small"
          label="New list"
          value={props.newListName}
          onChange={e => {
            props.onNewListNameChange(e.target.value)
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') props.onAddList()
          }}
        />
        <Button size="small" variant="contained" onClick={props.onAddList}>
          +
        </Button>
      </div>
      {props.configs.map(c => (
        <div
          key={c.id}
          className={`${s.item} ${c.id === props.selectedId ? s.active : ''}`}
          onClick={() => {
            props.onSelect(c.id)
          }}
        >
          <span className={s.itemName}>{c.name}</span>
          <span className={s.count}>{c.options.length}</span>
          <button
            className={s.del}
            onClick={e => {
              e.stopPropagation()
              props.onRemove(c.id)
            }}
          >
            ✕
          </button>
        </div>
      ))}
    </aside>
  )
}
