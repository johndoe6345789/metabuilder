import type { JsonValue } from '@/types/utility-types'
import type { RenderContext } from '../render-json-component'
import { evaluateExpression } from './evaluate-expression'

/** Evaluates every declared prop for a registry component, dropping any
 *  that resolve to undefined rather than passing it through literally. */
export function buildComponentProps(
  // Partial, not Record: a package author's ui.json node can genuinely
  // omit props -- see element-props.ts for the full reasoning.
  nodeObj: Partial<Record<string, JsonValue>>,
  context: RenderContext
): Record<string, JsonValue> {
  const props: Record<string, JsonValue> = {}
  const declared = nodeObj.props

  if (
    declared === null ||
    declared === undefined ||
    typeof declared !== 'object' ||
    Array.isArray(declared)
  ) {
    return props
  }

  for (const [key, value] of Object.entries(declared)) {
    const evaluated = evaluateExpression(value, context)
    if (evaluated !== undefined) props[key] = evaluated
  }

  return props
}
