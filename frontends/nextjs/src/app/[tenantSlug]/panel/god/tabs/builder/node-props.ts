import { paletteItem, type TreeNode } from './builder-registry'

/** A node's props merged over its type's defaults, so an unset field still
 *  shows its real starting value instead of blank. */
export function mergedProps(node: TreeNode): Record<string, unknown> {
  const defaults = paletteItem(node.type)?.defaults ?? {}
  return { ...defaults, ...node.props }
}
