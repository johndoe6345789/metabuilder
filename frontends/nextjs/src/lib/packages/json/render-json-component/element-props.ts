import type { JsonValue } from '@/types/utility-types'
import type { RenderContext } from '../render-json-component'
import { evaluateExpression } from './evaluate-expression'

/** className/style pass through as-is; href/src/alt are evaluated so a
 *  template expression in any of them resolves before it reaches the
 *  DOM element. */
export function buildElementProps(
  nodeObj: Record<string, JsonValue>,
  context: RenderContext
): Record<string, JsonValue> {
  const props: Record<string, JsonValue> = {}

  if (nodeObj.className !== null && nodeObj.className !== undefined) {
    props.className = nodeObj.className
  }
  if (nodeObj.style !== null && nodeObj.style !== undefined) {
    props.style = nodeObj.style
  }

  for (const key of ['href', 'src', 'alt'] as const) {
    if (nodeObj[key] === null || nodeObj[key] === undefined) continue
    const evaluated = evaluateExpression(nodeObj[key], context)
    if (evaluated !== undefined) props[key] = evaluated
  }

  return props
}
