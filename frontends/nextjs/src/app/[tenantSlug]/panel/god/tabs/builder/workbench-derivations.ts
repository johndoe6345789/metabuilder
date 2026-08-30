/** Pure derivations the workbench reads off its state, no React involved. */

import type { TreeNode } from './builder-registry'
import type { PublishTarget } from './component-tree-publish'

export const BLANK_TREE = '__blank__'

export interface SavedTree {
  path: string
  title: string
  hasTree: boolean
}

/**
 * The tree select's current value.
 *
 * Falls back to blank when the target's path names a tree that isn't (or
 * is no longer) in the saved list -- selecting a value the <select> does
 * not offer would silently show the browser's own first option instead.
 */
export function currentTreeValue(
  trees: readonly SavedTree[],
  target: Pick<PublishTarget, 'path'>
): string {
  return trees.some(t => t.path === target.path) ? target.path : BLANK_TREE
}

/** Every saved page that actually has a component tree to load. */
export function treesWithContent(pages: readonly SavedTree[]): SavedTree[] {
  return pages.filter(p => p.hasTree)
}

/**
 * Whether the selected node's DOM id collides with another node's.
 *
 * A duplicate id is invalid HTML and breaks aria references, but it is
 * invisible in the tree view, so this is the one place that can say so.
 */
export function hasDuplicateId(
  selected: Pick<TreeNode, 'props'>,
  idCounts: ReadonlyMap<string, number>
): boolean {
  const id = selected.props.id
  if (typeof id !== 'string' || id === '') return false
  return (idCounts.get(id) ?? 0) > 1
}
