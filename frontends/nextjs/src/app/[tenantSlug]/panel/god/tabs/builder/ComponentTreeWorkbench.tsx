'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
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
import { collectDomIds } from './component-tree-utils'
import s from './ComponentTreeTab.module.scss'

const BLANK = '__blank__'

type PaneView = 'palette' | 'tree' | 'props' | 'preview'

const PANES: { id: PaneView; label: string; icon: string }[] = [
  { id: 'palette', label: 'Add', icon: 'widgets' },
  { id: 'tree', label: 'Tree', icon: 'account_tree' },
  { id: 'props', label: 'Properties', icon: 'tune' },
  { id: 'preview', label: 'Preview', icon: 'visibility' },
]

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

  // Which pane the narrow layout shows. Ignored above the breakpoint, where
  // all four are on screen at once -- the CSS decides, so there is no width
  // measuring here.
  const [view, setView] = useState<PaneView>('tree')
  // Narrow screens only -- above the breakpoint the setup is always shown.
  const [setupOpen, setSetupOpen] = useState(false)

  // A duplicate DOM id is invalid HTML and breaks aria references, but it is
  // invisible in the tree, so the editor has to say so.
  const idCounts = useMemo(() => collectDomIds(t.tree), [t.tree])
  const selectedDomId =
    typeof t.selected.props.id === 'string' ? t.selected.props.id : ''
  const duplicateId =
    selectedDomId !== '' && (idCounts.get(selectedDomId) ?? 0) > 1

  // ⌘Z / ⇧⌘Z, but not while someone is typing into a property field -- there
  // the browser's own undo is what they mean.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'z') {
        return
      }
      const el = document.activeElement
      const tag = el?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      event.preventDefault()
      if (event.shiftKey) t.redo()
      else t.undo()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
    }
  }, [t])

  const trees = pages.filter(p => p.hasTree)
  const currentTree = trees.some(x => x.path === target.path)
    ? target.path
    : BLANK

  return (
    <div className={s.root}>
      <button
        type="button"
        className={`${s.setupToggle} ${setupOpen ? s.setupToggleOpen : ''}`}
        aria-expanded={setupOpen}
        onClick={() => {
          setSetupOpen(open => !open)
        }}
      >
        <span className="material-symbols-rounded" aria-hidden="true">
          chevron_right
        </span>
        Page setup — {target.path === '' ? 'no route' : target.path}
      </button>

      <div className={s.setup} data-open={setupOpen}>
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
      </div>

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

      <div className={s.history}>
        <button
          type="button"
          className={s.historyBtn}
          disabled={!t.canUndo}
          aria-label="Undo"
          title="Undo (⌘Z)"
          onClick={t.undo}
        >
          <span className="material-symbols-rounded" aria-hidden="true">
            undo
          </span>
          Undo
        </button>
        <button
          type="button"
          className={s.historyBtn}
          disabled={!t.canRedo}
          aria-label="Redo"
          title="Redo (⇧⌘Z)"
          onClick={t.redo}
        >
          <span className="material-symbols-rounded" aria-hidden="true">
            redo
          </span>
          Redo
        </button>
      </div>

      <div className={s.paneTabs} role="tablist" aria-label="Builder panes">
        {PANES.map(pane => (
          <button
            key={pane.id}
            type="button"
            role="tab"
            aria-selected={view === pane.id}
            className={`${s.paneTab} ${view === pane.id ? s.paneTabOn : ''}`}
            onClick={() => {
              setView(pane.id)
            }}
          >
            <span className="material-symbols-rounded" aria-hidden="true">
              {pane.icon}
            </span>
            {pane.label}
          </button>
        ))}
      </div>

      <div className={s.grid} data-view={view}>
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
          <div className={s.treePane}>
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
          </div>
          <div className={s.propsPane}>
          <div className={s.paneTitle}>Properties</div>
          <div className={s.props}>
            <ComponentTreePropsEditor
              node={t.selected}
              tenant={tenant}
              duplicateId={duplicateId}
              onChange={patch => {
                t.updateProps(t.selectedId, patch)
              }}
            />
          </div>
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
