'use client'

import { Typography } from '@/m3'
import { COMPONENT_CATALOG } from './component-catalog'
import { CatalogItem } from './CatalogItem'
import type { ComponentDef } from './types'
import s from './CatalogPanel.module.scss'

type Props = {
  selectedNodeId: string | null
  onAdd: (def: ComponentDef) => void
}

function groupByCategory(
  defs: ComponentDef[],
): Record<string, ComponentDef[]> {
  return defs.reduce<Record<string, ComponentDef[]>>((acc, def) => {
    const list = acc[def.category]
    if (list == null) {
      acc[def.category] = [def]
    } else {
      list.push(def)
    }
    return acc
  }, {})
}

export function CatalogPanel({ selectedNodeId, onAdd }: Props) {
  const grouped = groupByCategory(COMPONENT_CATALOG)

  return (
    <div className={s.root}>
      <div className={s.header}>
        <Typography variant="subtitle2">Component Catalog</Typography>
        <Typography variant="caption" color="text.secondary">
          {selectedNodeId != null
            ? 'Click to add to selected node'
            : 'Click to add to page root'}
        </Typography>
      </div>

      <div className={s.list}>
        {Object.entries(grouped).map(([category, defs]) => (
          <div key={category} className={s.group}>
            <Typography
              variant="overline"
              color="text.secondary"
              className={s.groupLabel}
            >
              {category}
            </Typography>
            {defs.map(def => (
              <CatalogItem
                key={def.type}
                def={def}
                onClick={() => { onAdd(def) }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
