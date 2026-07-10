'use client'

import { Button } from '@/m3'
import type { WorkflowJsonAsset } from './ide-types'
import s from './WorkflowJsonEditor.module.scss'

interface WorkflowJsonListProps {
  assets: WorkflowJsonAsset[]
  selectedId: string | null
  onSelect: (id: string) => void
  onAdd: () => void
}

export function WorkflowJsonList({
  assets,
  selectedId,
  onSelect,
  onAdd,
}: WorkflowJsonListProps) {
  return (
    <aside className={s.sidebar}>
      <div className={s.sidebarHeader}>Workflow JSON</div>
      <div className={s.assetList}>
        {assets.map((entry) => (
          <div
            key={entry.id}
            className={
              entry.id === selectedId
                ? `${s.assetItem} ${s.assetItemActive}`
                : s.assetItem
            }
            onClick={() => { onSelect(entry.id) }}
          >
            {entry.name}
          </div>
        ))}
      </div>
      <div className={s.sidebarFooter}>
        <Button variant="outlined" size="small" onClick={onAdd}>
          + New Workflow
        </Button>
      </div>
    </aside>
  )
}
