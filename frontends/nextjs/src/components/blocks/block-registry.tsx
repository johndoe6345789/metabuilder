'use client'

/**
 * Canonical component-block registry + renderer.
 *
 * A component tree is `{ type, props, children }`. This module is the single
 * source of truth for which `type`s exist, how they render, and the palette
 * metadata — used by BOTH the god-panel builder (preview) and production
 * pages (UIPageRenderer), so a tree renders identically wherever it lives.
 *
 * Heavy blocks (MetaBuilder self-hosting tools, webchat) are lazy-loaded so
 * tenant pages only load them when needed.
 */
import { cloneElement, isValidElement } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { WorkflowClick } from './form/WorkflowClick'
import { commonAttrs, withOwnClass } from './common-attrs'
import { DEFS } from './block-defs'
import type { BlockDef, PaletteItem, TreeNode } from './block-types'

export type {
  BlockCategory,
  BlockDef,
  PaletteItem,
  TreeNode,
} from './block-types'

export const BLOCK_REGISTRY: Partial<Record<string, BlockDef>> =
  Object.fromEntries(DEFS.map(d => [d.meta.type, d]))

export const PALETTE: PaletteItem[] = DEFS.map(d => d.meta)

export function paletteItem(type: string): PaletteItem | undefined {
  return BLOCK_REGISTRY[type]?.meta
}

/** Looks a block up by the plain-language name shown in the Add panel
 *  ("Container", "Heading 1") rather than its internal type key -- for BQL
 *  scripts and anything else that should never need to know a type key. */
export function paletteItemByName(name: string): PaletteItem | undefined {
  const target = name.trim().toLowerCase()
  return PALETTE.find(p => p.name.toLowerCase() === target)
}

/**
 * Attributes every block accepts, whatever it renders: identity, styling and
 * accessibility. They are applied centrally in renderNode rather than by each
 * block, because a block's render() only reads the props it knows about -- so
 * without this, setting an id or aria-label in the builder would silently do
 * nothing on 37 different block types.
 */
/**
 * Wrap a rendered block so clicking it runs the workflow it names.
 *
 * Applied here rather than by each block for the same reason commonAttrs
 * is: a block's render() only reads the props it knows about, so without
 * this only the handful that thought about clicks could ever act.
 */
function withWorkflowClick(
  props: Record<string, unknown>,
  el: ReactNode
): ReactNode {
  const named = props.onClickWorkflow
  const workflow = typeof named === 'string' ? named.trim() : ''
  if (workflow === '') return el
  return <WorkflowClick workflow={workflow}>{el}</WorkflowClick>
}

/** Render a component-tree node (and its children) to React. Canonical. */
export function renderNode(node: TreeNode): ReactNode {
  const def = BLOCK_REGISTRY[node.type]
  const kids = node.children.map(c => (
    <span key={c.id} style={{ display: 'contents' }}>
      {renderNode(c)}
    </span>
  ))
  if (def === undefined) return <em>Unknown block: {node.type}</em>
  // Attributes go on the block, and only then is it wrapped. The other way
  // round, cloneElement handed the author's class to WorkflowClick -- which
  // renders a display:contents span and reads no className -- so styling a
  // block silently stopped working the moment it was given a workflow.
  const el = withAttrs(node.props, def.render(node.props, kids))
  return withWorkflowClick(node.props, el)
}

/** The block, carrying whatever identity, class and aria props were set. */
function withAttrs(props: Record<string, unknown>, el: ReactNode): ReactNode {
  const attrs = commonAttrs(props)
  // Nothing set, or the block returned a fragment/string that cannot carry
  // attributes -- render it exactly as before.
  if (Object.keys(attrs).length === 0 || !isValidElement(el)) return el
  // The block set its own class; the author's is additional, not an
  // override. A block that forwards BlockAttrs itself applies the same rule
  // with the same helper -- see BlockButton.
  const own = (el.props as { className?: unknown }).className
  const merged =
    typeof own === 'string' && own !== '' ? withOwnClass(own, attrs) : attrs
  return cloneElement(el as ReactElement<Record<string, unknown>>, merged)
}

