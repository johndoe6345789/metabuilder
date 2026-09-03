'use client'

import { ComponentTreeOutline } from '../ComponentTreeOutline'
import { ComponentTreePropsEditor } from '../ComponentTreePropsEditor'
import { paletteItem } from '../builder-registry'
import type { useComponentTree } from '../use-component-tree'
import s from '../ComponentTreeTab.module.scss'

export interface MiddlePanesProps {
  t: ReturnType<typeof useComponentTree>
  tenant: string
  collapsed: ReadonlySet<string>
  onToggleCollapse: (id: string) => void
  duplicateId: boolean
}

/** The tree outline and the selected node's property editor, side by side. */
export function MiddlePanes(props: MiddlePanesProps) {
  const { t } = props

  return (
    <section className={s.middle}>
      <div className={s.treePane}>
        <div className={s.paneTitle}>Tree</div>
        <div className={s.outline}>
          <ComponentTreeOutline
            node={t.tree}
            depth={0}
            selectedId={t.selectedId}
            collapsed={props.collapsed}
            onToggleCollapse={props.onToggleCollapse}
            onAdd={t.addNode}
            onSelect={t.setSelectedId}
            onDelete={t.deleteNode}
            onMove={t.moveNode}
          />
        </div>
      </div>
      <div className={s.propsPane}>
        <div className={s.paneTitle}>
          <span className="material-symbols-rounded">
            {paletteItem(t.selected.type)?.icon ?? 'widgets'}
          </span>
          {paletteItem(t.selected.type)?.name ?? t.selected.type}
        </div>
        <div className={s.props}>
          <ComponentTreePropsEditor
            node={t.selected}
            tenant={props.tenant}
            duplicateId={props.duplicateId}
            onChange={patch => {
              t.updateProps(t.selectedId, patch)
            }}
          />
        </div>
      </div>
    </section>
  )
}
