'use client'

/**
 * Canonical component-block registry + renderer.
 *
 * A component tree is `{ type, props, children }`. This module is the single
 * source of truth for which `type`s exist, how they render, and the palette
 * metadata — used by BOTH the god-panel builder (preview) and production pages
 * (UIPageRenderer), so a tree renders identically wherever it lives.
 *
 * Heavy blocks (MetaBuilder self-hosting tools, webchat) are lazy-loaded so
 * tenant pages only load them when needed.
 */

import dynamic from 'next/dynamic'
import type { ReactNode } from 'react'
import { Avatar, Button, Card, Typography } from '@/m3'
import { runWorkflow } from '@/lib/workflow/run-workflow'
import { store } from '@/store/store'
import type { RootState } from '@/store/store'

export interface TreeNode {
  id: string
  type: string
  props: Record<string, unknown>
  children: TreeNode[]
}

export type BlockCategory = 'Layout' | 'Content' | 'Inputs' | 'Community' | 'MetaBuilder'

export interface PaletteItem {
  type: string
  name: string
  icon: string
  category: BlockCategory
  container: boolean
  defaults: Record<string, unknown>
}

interface BlockDef {
  meta: PaletteItem
  render: (props: Record<string, unknown>, children: ReactNode) => ReactNode
}

// ── lazy heavy blocks ────────────────────────────────────────────────
const loading = () => <span style={{ opacity: 0.5 }}>Loading…</span>
const Webchat = dynamic(
  () => import('@/components/webchat/Webchat').then((m) => ({ default: m.Webchat })),
  { ssr: false, loading })
const WorkflowEditorBlock = dynamic(
  () => import('@/app/(workspace)/god-panel/blocks/metabuilder-blocks').then((m) => ({ default: m.WorkflowEditorBlock })),
  { ssr: false, loading })
const PackageManagerBlock = dynamic(
  () => import('@/app/(workspace)/god-panel/blocks/metabuilder-blocks').then((m) => ({ default: m.PackageManagerBlock })),
  { ssr: false, loading })
const SchemaEditorBlock = dynamic(
  () => import('@/app/(workspace)/god-panel/blocks/metabuilder-blocks').then((m) => ({ default: m.SchemaEditorBlock })),
  { ssr: false, loading })

// Fire the wired workflow when a bound button is clicked (route→tree→workflow).
function fireWorkflow(): void {
  const state = store.getState() as unknown as RootState
  const wf = state.god.workflow
  if (wf.nodes.length === 0) {
    window.alert('No workflow wired yet.')
    return
  }
  const res = runWorkflow(wf)
  window.alert(`Ran "${wf.name}"\n\n${res.logs.join('\n')}\n\n→ ${JSON.stringify(res.output)}`)
}

const m = (type: string, name: string, icon: string, category: BlockCategory,
  container: boolean, defaults: Record<string, unknown> = {}): PaletteItem =>
  ({ type, name, icon, category, container, defaults })

const propText = (value: unknown, fallback = ''): string =>
  typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
    ? String(value)
    : fallback

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function propDirection(value: unknown): 'row' | 'column' {
  return value === 'row' ? 'row' : 'column'
}

function propGap(value: unknown): number {
  return typeof value === 'number' ? value : 12
}

function propNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' ? value : fallback
}

function renderButton(p: Record<string, unknown>): ReactNode {
  const href = propText(p.href)
  const variant = propText(p.variant, 'contained')
  const runWorkflow = p.runWorkflow === true
  const buttonProps: Record<string, unknown> = {
    variant,
    onClick: runWorkflow ? () => { fireWorkflow() } : undefined,
  }

  if (href.length > 0) {
    buttonProps.href = href
    buttonProps.component = 'a'
  }

  return <Button {...buttonProps}>{propText(p.label, 'Button')}</Button>
}

const DEFS: BlockDef[] = [
  { meta: m('container', 'Container', 'grid_view', 'Layout', true, { direction: 'column', gap: 12 }),
    render: (p, kids) => {
      const style = isRecord(p.style) ? p.style : {}
      return (
        <div
          style={{
            ...style,
            display: 'flex',
            flexDirection: propDirection(p.direction),
            gap: propGap(p.gap),
          }}
        >
          {kids}
        </div>
      )
    } },
  { meta: m('card', 'Card', 'crop_square', 'Layout', true),
    render: (_p, kids) => <Card style={{ padding: 16 }}>{kids}</Card> },
  { meta: m('grid', 'Grid', 'grid_on', 'Layout', true, { columns: 3, gap: 16 }),
    render: (p, kids) => (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${propNumber(p.columns, 3)}, 1fr)`,
          gap: propGap(p.gap),
        }}
      >
        {kids}
      </div>
    ) },
  { meta: m('divider', 'Divider', 'horizontal_rule', 'Layout', false, { margin: 16 }),
    render: (p) => (
      <hr
        style={{
          border: 'none',
          borderTop: '1px solid var(--mat-sys-outline-variant, #30363d)',
          margin: `${propNumber(p.margin, 16)}px 0`,
        }}
      />
    ) },
  { meta: m('heading', 'Heading', 'title', 'Content', false, { text: 'Heading' }),
    render: (p) => <Typography variant="h5">{propText(p.text, 'Heading')}</Typography> },
  { meta: m('text', 'Text', 'notes', 'Content', false, { text: 'Some text' }),
    render: (p) => <Typography variant="body1">{propText(p.text)}</Typography> },
  { meta: m('image', 'Image', 'image', 'Content', false, { src: '', alt: '', radius: 0 }),
    render: (p) => {
      const src = propText(p.src)
      if (src.length === 0) return <em>Image: no src set</em>
      return (
        <img
          src={src}
          alt={propText(p.alt)}
          style={{
            maxWidth: '100%',
            borderRadius: propNumber(p.radius, 0),
          }}
        />
      )
    } },
  { meta: m('avatar', 'Avatar', 'account_circle', 'Content', false, { initials: 'U', size: 'md' }),
    render: (p) => {
      const size = propText(p.size, 'md')
      const src = propText(p.src)
      return (
        <Avatar
          src={src.length > 0 ? src : undefined}
          sm={size === 'sm'}
          md={size === 'md'}
          lg={size === 'lg'}
          xl={size === 'xl'}
        >
          {propText(p.initials, 'U')}
        </Avatar>
      )
    } },
  { meta: m('stat', 'Stat', 'monitoring', 'Content', false, { label: 'Members', value: '0' }),
    render: (p) => (
      <div>
        <Typography variant="h4">{propText(p.value, '0')}</Typography>
        <Typography variant="body2" color="text.secondary">
          {propText(p.label, 'Label')}
        </Typography>
      </div>
    ) },
  { meta: m('list-item', 'List Item', 'list', 'Content', false,
      { icon: 'notifications', title: 'Title', description: 'Description' }),
    render: (p) => (
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <span className="material-symbols-rounded" aria-hidden="true">
          {propText(p.icon, 'notifications')}
        </span>
        <div>
          <Typography variant="body1">{propText(p.title, 'Title')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {propText(p.description)}
          </Typography>
        </div>
      </div>
    ) },
  { meta: m('button', 'Button', 'smart_button', 'Inputs', false, { label: 'Click me' }),
    render: renderButton },
  { meta: m('pkg.webchat', 'Webchat', 'chat', 'Community', false, { channel: '#general' }),
    render: (p) => <Webchat channel={propText(p.channel, '#general')} /> },
  { meta: m('mb.WorkflowEditor', 'Workflow Editor', 'account_tree', 'MetaBuilder', false),
    render: () => <WorkflowEditorBlock /> },
  { meta: m('mb.PackageManager', 'Package Manager', 'deployed_code', 'MetaBuilder', false),
    render: () => <PackageManagerBlock /> },
  { meta: m('mb.SchemaEditor', 'Schema Editor', 'schema', 'MetaBuilder', false),
    render: () => <SchemaEditorBlock /> },
]

export const BLOCK_REGISTRY: Partial<Record<string, BlockDef>> =
  Object.fromEntries(DEFS.map((d) => [d.meta.type, d]))

export const PALETTE: PaletteItem[] = DEFS.map((d) => d.meta)

export function paletteItem(type: string): PaletteItem | undefined {
  return BLOCK_REGISTRY[type]?.meta
}

/** Render a component-tree node (and its children) to React. Canonical. */
export function renderNode(node: TreeNode): ReactNode {
  const def = BLOCK_REGISTRY[node.type]
  const kids = node.children.map((c) => (
    <span key={c.id} style={{ display: 'contents' }}>{renderNode(c)}</span>
  ))
  if (def === undefined) return <em>Unknown block: {node.type}</em>
  return def.render(node.props, kids)
}
