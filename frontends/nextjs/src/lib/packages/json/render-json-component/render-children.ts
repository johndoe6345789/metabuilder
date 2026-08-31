import { createElement, Fragment, type ReactElement, type ReactNode } from 'react'
import type { JsonValue } from '@/types/utility-types'
import type { RenderContext } from '../render-json-component'
import { evaluateExpression } from './evaluate-expression'

type RenderNode = (
  node: JsonValue,
  context: RenderContext
) => ReactElement

/** A node's `children` can be a template string, a list of child nodes,
 *  or a single nested node -- the same three-way branch showed up twice
 *  in the original file (once for a registry component, once for a
 *  plain element), so it lives here once instead. */
export function renderChildren(
  nodeChildren: JsonValue | undefined,
  context: RenderContext,
  renderNode: RenderNode
): ReactNode {
  if (nodeChildren === null || nodeChildren === undefined) return null

  if (typeof nodeChildren === 'string') {
    return evaluateExpression(nodeChildren, context) as ReactNode
  }

  if (Array.isArray(nodeChildren)) {
    return nodeChildren.map((child, index) => {
      if (typeof child === 'string') {
        return evaluateExpression(child, context) as ReactNode
      }
      return createElement(
        Fragment,
        { key: index },
        renderNode(child, context)
      )
    })
  }

  return renderNode(nodeChildren, context)
}
