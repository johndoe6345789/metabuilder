'use client'

/**
 * Canonical component-block registry + renderer.
 *
 * A component tree is `{ type, props, children }`. This module is the single
 * source of truth for which `type`s exist, how they render, and the palette
 * metadata — used by BOTH the god-panel builder (preview) and production pages
 * (UIPageRenderer), so a tree renders identically wherever it lives.
 *
 * Heavy blocks (MetaBuilder self-hosting tools, webchat) are lazy-loaded so they
 * never bloat a tenant page bundle unless the page actually uses them.
 */

import dynamic from 'next/dynamic'
import type { ReactNode } from 'react'
import { Button, Card, Typography } from '@/m3'
import { runWorkflow } from '@/lib/workflow/run-workflow'
import { store } from '@/store/store'

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
  const wf = store.getState().god.workflow
  if (!wf || wf.nodes.length === 0) { window.alert('No workflow wired yet.'); return }
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

const DEFS: BlockDef[] = [
  { meta: m('container', 'Container', 'grid_view', 'Layout', true, { direction: 'column', gap: 12 }),
    render: (p, kids) => (
      <div style={{ display: 'flex', flexDirection: (p.direction as 'row' | 'column') ?? 'column', gap: (p.gap as number) ?? 12 }}>{kids}</div>
    ) },
  { meta: m('card', 'Card', 'crop_square', 'Layout', true),
    render: (_p, kids) => <Card style={{ padding: 16 }}>{kids}</Card> },
  { meta: m('heading', 'Heading', 'title', 'Content', false, { text: 'Heading' }),
    render: (p) => <Typography variant="h5">{propText(p.text, 'Heading')}</Typography> },
  { meta: m('text', 'Text', 'notes', 'Content', false, { text: 'Some text' }),
    render: (p) => <Typography variant="body1">{propText(p.text)}</Typography> },
  { meta: m('button', 'Button', 'smart_button', 'Inputs', false, { label: 'Click me' }),
    render: (p) => <Button variant="contained" onClick={p.runWorkflow ? () => { fireWorkflow() } : undefined}>{propText(p.label, 'Button')}</Button> },
  { meta: m('pkg.webchat', 'Webchat', 'chat', 'Community', false, { channel: '#general' }),
    render: (p) => <Webchat channel={propText(p.channel, '#general')} /> },
  { meta: m('mb.WorkflowEditor', 'Workflow Editor', 'account_tree', 'MetaBuilder', false),
    render: () => <WorkflowEditorBlock /> },
  { meta: m('mb.PackageManager', 'Package Manager', 'deployed_code', 'MetaBuilder', false),
    render: () => <PackageManagerBlock /> },
  { meta: m('mb.SchemaEditor', 'Schema Editor', 'schema', 'MetaBuilder', false),
    render: () => <SchemaEditorBlock /> },
]

export const BLOCK_REGISTRY: Record<string, BlockDef> =
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
  if (!def) return <em>Unknown block: {node.type}</em>
  return def.render(node.props, kids)
}
