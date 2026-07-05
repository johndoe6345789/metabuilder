'use client'

import { Button, TextField, Typography } from '@/m3'
import { useComponentTree } from './use-component-tree'
import { PALETTE, paletteItem, renderNode, type PaletteItem, type TreeNode } from './builder-registry'
import s from './ComponentTreeTab.module.scss'

const CATEGORIES = ['Layout', 'Content', 'Inputs', 'Community', 'MetaBuilder'] as const

function Outline({ node, depth, selectedId, onSelect, onDelete, onMove }: {
  node: TreeNode; depth: number; selectedId: string
  onSelect: (id: string) => void; onDelete: (id: string) => void
  onMove: (dragId: string, targetId: string) => void
}) {
  const item = paletteItem(node.type)
  return (
    <>
      <div
        className={`${s.row} ${node.id === selectedId ? s.rowActive : ''}`}
        style={{ paddingLeft: 8 + depth * 16 }}
        draggable={node.id !== 'root'}
        onClick={() => { onSelect(node.id) }}
        onDragStart={(e) => { e.dataTransfer.setData('text/node-id', node.id) }}
        onDragOver={(e) => { e.preventDefault() }}
        onDrop={(e) => {
          e.preventDefault()
          const dragId = e.dataTransfer.getData('text/node-id')
          if (dragId) onMove(dragId, node.id)
        }}
      >
        <span className={s.grip}>⠿</span>
        <span className="material-symbols-rounded">{item?.icon ?? 'widgets'}</span>
        <span className={s.rowName}>{item?.name ?? node.type}</span>
        {node.id !== 'root' && (
          <button className={s.del} onClick={(e) => { e.stopPropagation(); onDelete(node.id) }}>✕</button>
        )}
      </div>
      {node.children.map((c) => (
        <Outline key={c.id} node={c} depth={depth + 1}
          selectedId={selectedId} onSelect={onSelect} onDelete={onDelete} onMove={onMove} />
      ))}
    </>
  )
}

function PropsEditor({ node, onChange }: {
  node: TreeNode; onChange: (patch: Record<string, unknown>) => void
}) {
  const p = node.props
  if (node.type === 'heading' || node.type === 'text') {
    return (
      <TextField size="small" fullWidth label="Text" value={String(p.text ?? '')}
        onChange={(e) => { onChange({ text: e.target.value }) }} />
    )
  }
  if (node.type === 'button') {
    return (
      <div className={s.propCol}>
        <TextField size="small" fullWidth label="Label" value={String(p.label ?? '')}
          onChange={(e) => { onChange({ label: e.target.value }) }} />
        <Button size="small" variant={p.runWorkflow ? 'contained' : 'outlined'}
          onClick={() => { onChange({ runWorkflow: !p.runWorkflow }) }}>
          {p.runWorkflow ? '✓ Runs workflow on click' : '⚡ Wire workflow on click'}
        </Button>
      </div>
    )
  }
  if (node.type === 'container') {
    return (
      <div className={s.propRow}>
        <Button size="small" variant={p.direction === 'row' ? 'contained' : 'outlined'}
          onClick={() => { onChange({ direction: 'row' }) }}>Row</Button>
        <Button size="small" variant={p.direction !== 'row' ? 'contained' : 'outlined'}
          onClick={() => { onChange({ direction: 'column' }) }}>Column</Button>
        <TextField size="small" label="Gap" value={String(p.gap ?? 12)}
          onChange={(e) => { onChange({ gap: Number(e.target.value) || 0 }) }} />
      </div>
    )
  }
  return <Typography variant="body2" color="text.secondary">No editable properties.</Typography>
}

export function ComponentTreeTab() {
  const t = useComponentTree()

  return (
    <div className={s.root}>
      <div className={s.publishBar}>
        {t.dirty ? <span className={s.dot} /> : null}
        <span className={`${s.status} ${t.dirty ? '' : s.clean}`}>
          {t.dirty ? 'Staged changes — not yet published' : 'Published — up to date'}
        </span>
        <span className={s.spacer} />
        <Button variant="contained" size="small" disabled={!t.dirty || t.publishing}
          onClick={() => { void t.publish() }}>
          {t.publishing ? 'Publishing…' : '⇧ Publish'}
        </Button>
      </div>

      <div className={s.grid}>
        <aside className={s.palette}>
          {CATEGORIES.map((cat) => (
            <div key={cat} className={s.palGroup}>
              <div className={s.palTitle}>{cat}</div>
              {PALETTE.filter((i: PaletteItem) => i.category === cat).map((i) => (
                <button key={i.type} className={s.palItem} onClick={() => { t.addNode(i.type) }}>
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
            <Outline node={t.tree} depth={0} selectedId={t.selectedId}
              onSelect={t.setSelectedId} onDelete={t.deleteNode} onMove={t.moveNode} />
          </div>
          <div className={s.paneTitle}>Properties</div>
          <div className={s.props}>
            <PropsEditor node={t.selected}
              onChange={(patch) => { t.updateProps(t.selectedId, patch) }} />
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
