/** Resolving what a Repeat node iterates over. */

import { evaluate } from '../vault-evaluate'
import { templateValue } from '../vault-template'
import type { Context } from '../vault-context'
import type { VaultTreeNode } from '../vault-view'

/** The array to repeat over, or null when the node can't be repeated. */
export function repeatSource(
  node: VaultTreeNode,
  context: Context
): unknown[] | null {
  if (node.source === undefined || node.item === undefined) return null
  const source = evaluate(node.source, context)
  return Array.isArray(source) ? source : null
}

/** The context one repeated item renders under -- the loop var plus index. */
export function scopedContext(
  node: Pick<VaultTreeNode, 'item'>,
  context: Context,
  item: unknown,
  index: number
): Context {
  return { ...context, [node.item as string]: item, index }
}

/** The React key for one repeated item: the node's own key expression,
 *  or the array index when it declares none. */
export function repeatKey(
  node: Pick<VaultTreeNode, 'key'>,
  scoped: Context,
  index: number
): string | number {
  return node.key === undefined
    ? index
    : templateValue(evaluate(node.key, scoped))
}
