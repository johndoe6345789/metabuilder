import type { JsonValue } from '@/types/utility-types'
import type { RenderContext } from '../render-json-component'
import { evaluateSimpleExpression } from './evaluate-simple-expression'

const MAX_EXPRESSION_LENGTH = 1000
const TEMPLATE_PATTERN = /^\{\{(.+?)\}\}$/

/** Evaluate a template expression like `{{props.title}}`. Anything that
 *  isn't a `{{...}}` string -- including a plain string -- is returned
 *  unchanged, matching a `$template`/`$path` binding style rather than
 *  treating every string as potential markup. */
export function evaluateExpression(
  expr: JsonValue,
  context: RenderContext
): JsonValue | undefined {
  if (typeof expr !== 'string') return expr

  // Length limit to prevent ReDoS attacks.
  if (expr.length > MAX_EXPRESSION_LENGTH) return expr

  const match = expr.match(TEMPLATE_PATTERN)
  const inner = match?.[1]
  if (inner === undefined || inner.length === 0) return expr

  try {
    return evaluateSimpleExpression(inner.trim(), context)
  } catch {
    // Silently return original expression on evaluation failure.
    return expr
  }
}
