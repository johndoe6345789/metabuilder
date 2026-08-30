/** Building a node's runtime props from its declarative definition. */

import { evaluate } from '../vault-evaluate'
import type { Context } from '../vault-context'
import type { VaultTreeNode } from '../vault-view'

export function nodeProps(
  node: VaultTreeNode,
  context: Context,
  classNames: Record<string, string | undefined>
): Record<string, unknown> {
  const props = Object.fromEntries(
    Object.entries(node.props ?? {}).map(([key, value]) => [
      key,
      evaluate(value, context),
    ])
  )
  if (node.className !== undefined) {
    props.className =
      typeof node.className === 'string'
        ? classNames[node.className]
        : evaluate(node.className, context)
  }
  return props
}

/** The same className resolution nodeProps does, exposed on its own for
 *  the components (div/header/button/...) that need it apart from props. */
export function resolveClassName(
  node: Pick<VaultTreeNode, 'className'>,
  context: Context,
  classNames: Record<string, string | undefined>
): string | undefined {
  if (node.className === undefined) return undefined
  return typeof node.className === 'string'
    ? classNames[node.className]
    : (evaluate(node.className, context) as string | undefined)
}
