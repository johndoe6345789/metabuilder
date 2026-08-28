/**
 * The shapes a component tree is made of.
 *
 * Shared by block-defs (which declares every block) and block-registry
 * (which looks them up and renders a tree), so neither has to import the
 * other just for a type.
 */

import type { ReactNode } from 'react'

export interface TreeNode {
  id: string
  type: string
  props: Record<string, unknown>
  children: TreeNode[]
}

export type BlockCategory =
  | 'HTML'
  | 'Layout'
  | 'Content'
  | 'Inputs'
  | 'Feedback'
  | 'Community'
  | 'MetaBuilder'

export interface PaletteItem {
  type: string
  name: string
  icon: string
  category: BlockCategory
  container: boolean
  defaults: Record<string, unknown>
}

export interface BlockDef {
  meta: PaletteItem
  render: (props: Record<string, unknown>, children: ReactNode) => ReactNode
}

// ── lazy heavy blocks ────────────────────────────────────────────────
