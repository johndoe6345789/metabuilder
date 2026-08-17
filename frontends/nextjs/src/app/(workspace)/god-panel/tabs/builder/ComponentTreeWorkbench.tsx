'use client'

import { useState } from 'react'
import { useComponentTree } from './use-component-tree'
import { PALETTE, renderNode, type PaletteItem } from './builder-registry'
import { CATEGORIES } from './component-tree-categories'
import { ComponentTreeOutline } from './ComponentTreeOutline'
import { ComponentTreePropsEditor } from './ComponentTreePropsEditor'
import { ComponentTreePublishBar } from './ComponentTreePublishBar'
import { ComponentTreeTargetPicker } from './ComponentTreeTargetPicker'
import { DEFAULT_PUBLISH_TARGET, type PublishTarget } from './component-tree-publish'
import s from './ComponentTreeTab.module.scss'

export function ComponentTreeWorkbench() {
  const t = useComponentTree()
  const [target, setTarget] = useState<PublishTarget>(DEFAULT_PUBLISH_TARGET)

  return (
    <div className={s.root}>
      <ComponentTreeTargetPicker
        target={target}
        onChange={patch => {
          setTarget(prev => ({ ...prev, ...patch }))
        }}
        loading={t.loading}
        onLoad={() => {
          void t.load(target.tenant, target.path).then(loaded => {
            if (loaded !== null) {
              setTarget(prev => ({ ...prev, ...loaded }))
            }
          })
        }}
      />
      <ComponentTreePublishBar
        dirty={t.dirty}
        publishing={t.publishing}
        onPublish={() => {
          void t.publish(target)
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
