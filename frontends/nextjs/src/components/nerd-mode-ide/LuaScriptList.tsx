'use client'

import { Button } from '@/m3'
import type { ScriptEntry } from './ide-types'
import s from './LuaEditor.module.scss'

interface LuaScriptListProps {
  scripts: ScriptEntry[]
  selectedId: string | null
  onSelect: (id: string) => void
  onAdd: () => void
}

export function LuaScriptList({
  scripts,
  selectedId,
  onSelect,
  onAdd,
}: LuaScriptListProps) {
  return (
    <aside className={s.sidebar}>
      <div className={s.sidebarHeader}>Lua Scripts</div>
      <div className={s.scriptList}>
        {scripts.map((entry) => (
          <div
            key={entry.id}
            className={
              entry.id === selectedId
                ? `${s.scriptItem} ${s.scriptItemActive}`
                : s.scriptItem
            }
            onClick={() => { onSelect(entry.id) }}
          >
            {entry.name}
          </div>
        ))}
      </div>
      <div className={s.sidebarFooter}>
        <Button variant="outlined" size="small" onClick={onAdd}>
          + New Script
        </Button>
      </div>
    </aside>
  )
}
