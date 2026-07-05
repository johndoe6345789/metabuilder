'use client'

/**
 * Component-tree building blocks: the palette + a lightweight recursive
 * renderer. Includes plain primitives, a few M3 components, and MetaBuilder's
 * own tools (self-hosting). The full JSON renderer wires in during the fixing
 * phase; this keeps the tree editor self-contained and working now.
 */

import type { ReactNode } from 'react'
import { Button, Card, Typography } from '@/m3'
import { Webchat } from '@/components/webchat/Webchat'
import type { Workflow } from '@/workflow-editor'
import { idbGet } from '@/lib/persist/idb-kv'
import { runWorkflow } from '@/lib/workflow/run-workflow'
import { METABUILDER_BLOCKS } from '../../blocks/metabuilder-blocks'

// Fire the wired workflow when a bound button is clicked (route→tree→workflow).
async function fireWorkflow(): Promise<void> {
  const wf = await idbGet<Workflow>('god.workflow')
  if (!wf) { window.alert('No workflow wired yet.'); return }
  const res = runWorkflow(wf)
  window.alert(`Ran "${wf.name}"\n\n${res.logs.join('\n')}\n\n→ ${JSON.stringify(res.output)}`)
}

export interface TreeNode {
  id: string
  type: string
  props: Record<string, unknown>
  children: TreeNode[]
}

export interface PaletteItem {
  type: string
  name: string
  icon: string
  category: 'Layout' | 'Content' | 'Inputs' | 'MetaBuilder' | 'Community'
  container: boolean
  defaults: Record<string, unknown>
}

export const PALETTE: PaletteItem[] = [
  { type: 'container', name: 'Container', icon: 'grid_view', category: 'Layout', container: true, defaults: { direction: 'column', gap: 12 } },
  { type: 'card', name: 'Card', icon: 'crop_square', category: 'Layout', container: true, defaults: {} },
  { type: 'heading', name: 'Heading', icon: 'title', category: 'Content', container: false, defaults: { text: 'Heading' } },
  { type: 'text', name: 'Text', icon: 'notes', category: 'Content', container: false, defaults: { text: 'Some text' } },
  { type: 'button', name: 'Button', icon: 'smart_button', category: 'Inputs', container: false, defaults: { label: 'Click me' } },
  { type: 'pkg.webchat', name: 'Webchat', icon: 'chat', category: 'Community', container: false, defaults: { channel: '#general' } },
  ...METABUILDER_BLOCKS.map((b) => ({
    type: b.type, name: b.name, icon: b.icon,
    category: 'MetaBuilder' as const, container: false, defaults: {},
  })),
]

export function paletteItem(type: string): PaletteItem | undefined {
  return PALETTE.find((p) => p.type === type)
}

const MB = Object.fromEntries(METABUILDER_BLOCKS.map((b) => [b.type, b.component]))

/** Render a single tree node (and its children) to React. */
export function renderNode(node: TreeNode): ReactNode {
  const kids = node.children.map((c) => (
    <span key={c.id} style={{ display: 'contents' }}>{renderNode(c)}</span>
  ))
  const p = node.props

  switch (node.type) {
    case 'container':
      return (
        <div style={{
          display: 'flex',
          flexDirection: (p.direction as 'row' | 'column') ?? 'column',
          gap: (p.gap as number) ?? 12,
        }}>{kids}</div>
      )
    case 'card':
      return <Card style={{ padding: 16 }}>{kids}</Card>
    case 'heading':
      return <Typography variant="h5">{String(p.text ?? 'Heading')}</Typography>
    case 'text':
      return <Typography variant="body1">{String(p.text ?? '')}</Typography>
    case 'button':
      return (
        <Button variant="contained"
          onClick={p.runWorkflow ? () => { void fireWorkflow() } : undefined}>
          {String(p.label ?? 'Button')}
        </Button>
      )
    case 'pkg.webchat':
      return <Webchat channel={String(p.channel ?? '#general')} />
    default: {
      const Comp = MB[node.type]
      return Comp ? <Comp /> : <em>Unknown: {node.type}</em>
    }
  }
}
