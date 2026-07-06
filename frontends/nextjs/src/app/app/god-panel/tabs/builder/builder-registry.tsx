'use client'

/**
 * The builder's block registry is now the shared canonical registry so the
 * god-panel preview and production pages render component trees identically.
 * Kept as a re-export for existing imports.
 */

export {
  BLOCK_REGISTRY, PALETTE, paletteItem, renderNode,
  type TreeNode, type PaletteItem, type BlockCategory,
} from '@/components/blocks/block-registry'
