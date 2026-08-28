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
import { cloneElement, isValidElement } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { commonAttrs } from './common-attrs'
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

/**
 * Attributes every block accepts, whatever it renders: identity, styling and
 * accessibility. They are applied centrally in renderNode rather than by each
 * block, because a block's render() only reads the props it knows about -- so
 * without this, setting an id or aria-label in the builder would silently do
 * nothing on 37 different block types.
 */
/** Render a component-tree node (and its children) to React. Canonical. */
export function renderNode(node: TreeNode): ReactNode {
  const def = BLOCK_REGISTRY[node.type]
  const kids = node.children.map(c => (
    <span key={c.id} style={{ display: 'contents' }}>
      {renderNode(c)}
    </span>
  ))
  if (def === undefined) return <em>Unknown block: {node.type}</em>
  const el = def.render(node.props, kids)
  const attrs = commonAttrs(node.props)
  // Nothing set, or the block returned a fragment/string that cannot carry
  // attributes -- render it exactly as before.
  if (Object.keys(attrs).length === 0 || !isValidElement(el)) return el
  const existing = (el.props as { className?: unknown }).className
  const added = attrs.className
  if (
    typeof existing === 'string' &&
    existing !== '' &&
    typeof added === 'string'
  ) {
    // The block set its own class; the author's is additional, not a override.
    attrs.className = `${existing} ${added}`
  }
  return cloneElement(el as ReactElement<Record<string, unknown>>, attrs)
}

