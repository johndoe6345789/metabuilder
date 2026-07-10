'use client'

import { Typography } from '@/m3'
import { useComponentTree } from './use-component-tree'
import { PALETTE, renderNode, type PaletteItem } from './builder-registry'
import { CATEGORIES } from './component-tree-categories'
import { ComponentTreeOutline } from './ComponentTreeOutline'
import { ComponentTreePropsEditor } from './ComponentTreePropsEditor'
import { ComponentTreePublishBar } from './ComponentTreePublishBar'
import s from './ComponentTreeTab.module.scss'

export function ComponentTreeWorkbench() {
  const t = useComponentTree()

  return (
    <div className={s.root}>
      <ComponentTreePublishBar
        dirty={t.dirty}
        publishing={t.publishing}
        onPublish={() => {
          void t.publish()
        }}
      />

      <div className={s.grid}>
        <aside className={s.palette}>
          {CATEGORIES.map(cat => (
            <div key={cat} className={s.palGroup}>
              <div className={s.palTitle}>{cat}</div>
              {PALETTE.filter((i: PaletteItem) => i.category === cat).map(i => (
                <button
                  key={i.type}
                  className={s.palItem}
                  onClick={() => {
                    t.addNode(i.type)
                  }}
                >
                  <span className="material-symbols-rounded">{i.icon}</span>
                  {i.name}
                </button>
              ))}
            </div>
          ))}
        </aside>

        <section className={s.middle}>
          <div className={s.paneTitle}>Tree</div>
          <div className={s.outline}>
            <ComponentTreeOutline
              node={t.tree}
              depth={0}
              selectedId={t.selectedId}
              onSelect={t.setSelectedId}
              onDelete={t.deleteNode}
              onMove={t.moveNode}
            />
          </div>
          <div className={s.paneTitle}>Properties</div>
          <div className={s.props}>
            <ComponentTreePropsEditor
              node={t.selected}
              onChange={patch => {
                t.updateProps(t.selectedId, patch)
              }}
            />
          </div>
        </section>

        <section className={s.previewWrap}>
          <div className={s.paneTitle}>Live preview</div>
          <div className={s.preview}>{renderNode(t.tree)}</div>
        </section>
      </div>
    </div>
  )
}
