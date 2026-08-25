'use client'

import { useCallback, useEffect, useState } from 'react'
import { FormControl, FormLabel, Select } from '@/m3'
import { useAuthContext } from '@/app/_components/auth-provider/auth-provider-component'
import { normalizeTenantId } from '@/lib/tenant/workspace-paths'
import { useComponentTree } from './use-component-tree'
import { PALETTE, renderNode, type PaletteItem } from './builder-registry'
import { CATEGORIES } from './component-tree-categories'
import {
  ComponentTreeOutline,
  PALETTE_MIME,
} from './ComponentTreeOutline'
import { ComponentTreePropsEditor } from './ComponentTreePropsEditor'
import { ComponentTreePublishBar } from './ComponentTreePublishBar'
import { ComponentTreeTargetPicker } from './ComponentTreeTargetPicker'
import { DEFAULT_PUBLISH_TARGET, type PublishTarget } from './component-tree-publish'
import { usePageConfigs } from './use-page-configs'
import s from './ComponentTreeTab.module.scss'

const BLANK = '__blank__'

export function ComponentTreeWorkbench() {
  const t = useComponentTree()
  const auth = useAuthContext()
  // The tenant is whoever is signed in -- it was never a choice to make here.
  const tenant = normalizeTenantId(auth.user?.tenantId)
  const [target, setTarget] = useState<PublishTarget>({
    ...DEFAULT_PUBLISH_TARGET,
    tenant,
  })

  useEffect(() => {
    setTarget(prev => (prev.tenant === tenant ? prev : { ...prev, tenant }))
  }, [tenant])
  // Collapse state is held here rather than inside the recursive outline, so
  // it survives the re-render every tree edit causes.
  const { rows: pages } = usePageConfigs(tenant)
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set())
  const toggleCollapse = useCallback((id: string) => {
    setCollapsed(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const trees = pages.filter(p => p.hasTree)
  const currentTree = trees.some(x => x.path === target.path)
    ? target.path
    : BLANK

  return (
    <div className={s.root}>
      <div className={s.treeBar}>
        <FormControl>
          <FormLabel htmlFor="builder-tree">Component tree</FormLabel>
          <Select
            native
            value={currentTree}
            inputProps={{ id: 'builder-tree' }}
            onChange={
              ((event: React.ChangeEvent<HTMLSelectElement>) => {
                const value = event.target.value
                if (value === BLANK) {
                  t.resetTree()
                  return
                }
                const row = pages.find(p => p.path === value)
                setTarget(prev => ({
                  ...prev,
                  path: value,
                  title: row?.title ?? prev.title,
                }))
                void t.load(tenant, value)
              }) as never
            }
          >
            <option value={BLANK}>
              {trees.length > 0 ? 'Blank tree' : 'Blank tree — none saved yet'}
            </option>
            {trees.map(x => (
              <option key={x.id} value={x.path}>
                {x.title} — {x.path}
              </option>
            ))}
          </Select>
        </FormControl>
      </div>

      <ComponentTreeTargetPicker
        pages={pages}
        onPickRoute={path => {
          const row = pages.find(p => p.path === path)
          setTarget(prev => ({
            ...prev,
            path,
            title: row?.title ?? prev.title,
          }))
          void t.load(tenant, path)
        }}
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
      {t.conflict !== null && (

        <div className={s.conflict} role="alert">{t.conflict}</div>

      )}

      <ComponentTreePublishBar
        path={target.path}
        tenant={tenant}
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
                  draggable
                  onDragStart={event => {
                    event.dataTransfer.setData(PALETTE_MIME, i.type)
                    event.dataTransfer.effectAllowed = 'copy'
                  }}
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
              collapsed={collapsed}
              onToggleCollapse={toggleCollapse}
              onAdd={t.addNode}
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
