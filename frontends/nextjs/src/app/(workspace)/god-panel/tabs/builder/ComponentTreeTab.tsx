'use client'

import { Button, Typography } from '@/m3'
import { useComponentTree } from './use-component-tree'
import {
  PALETTE,
  renderNode,
  type PaletteItem,
} from './builder-registry'
import { ComponentTreeOutline } from './ComponentTreeOutline'
import { ComponentTreePropsEditor } from './ComponentTreePropsEditor'
import s from './ComponentTreeTab.module.scss'

const CATEGORIES = [
  'Layout',
  'Content',
  'Inputs',
  'Community',
  'MetaBuilder',
] as const

export function ComponentTreeTab() {
  const t = useComponentTree()

  return (
    <div className={s.root}>
      <div className={s.publishBar}>
        {t.dirty ? <span className={s.dot} /> : null}
        <span className={`${s.status} ${t.dirty ? '' : s.clean}`}>
          {t.dirty
            ? 'Staged changes — not yet published'
            : 'Published — up to date'}
        </span>
        <span className={s.spacer} />
        <Button
          variant="contained"
          size="small"
          disabled={!t.dirty || t.publishing}
          onClick={() => {
            void t.publish()
          }}
        >
          {t.publishing ? 'Publishing…' : '⇧ Publish'}
        </Button>
      </div>

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
