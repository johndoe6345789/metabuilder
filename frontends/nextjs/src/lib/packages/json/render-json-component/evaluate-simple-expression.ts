import type { JsonValue } from '@/types/utility-types'
import type { RenderContext } from '../render-json-component'
import { isTruthy } from './truthiness'

function isIndexableObject(
  value: JsonValue | undefined
): value is Record<string, JsonValue> {
  return (
    value !== null &&
    value !== undefined &&
    typeof value === 'object' &&
    !Array.isArray(value)
  )
}

/** No arbitrary code execution: property access (`props.title`), simple
 *  negation (`!flag`), and a single-level ternary (`flag ? a : b`) --
 *  nothing this can't parse by splitting on `.`, `?`, and `:`. */
export function evaluateSimpleExpression(
  expr: string,
  context: RenderContext
): JsonValue | undefined {
  const parts = expr.split('.')
  let value: JsonValue | undefined = context

  for (const part of parts) {
    if (part.includes('?')) return evaluateTernary(part, context, value)
    if (part.startsWith('!')) return evaluateNegation(part, value)
    if (!isIndexableObject(value)) return undefined
    value = value[part]
  }

  return value
}

function evaluateTernary(
  part: string,
  context: RenderContext,
  fallback: JsonValue | undefined
): JsonValue | undefined {
  const [condition, branches] = part.split('?')
  if (condition === undefined || condition.length === 0) return fallback
  if (branches === undefined || branches.length === 0) return fallback

  const [trueBranch, falseBranch] = branches.split(':')
  if (trueBranch === undefined || trueBranch.length === 0) return fallback
  if (falseBranch === undefined || falseBranch.length === 0) return fallback

  const conditionValue = evaluateSimpleExpression(condition.trim(), context)
  return isTruthy(conditionValue)
    ? evaluateSimpleExpression(trueBranch.trim(), context)
    : evaluateSimpleExpression(falseBranch.trim(), context)
}

function evaluateNegation(
  part: string,
  value: JsonValue | undefined
): boolean {
  const innerPart = part.substring(1)
  const target = isIndexableObject(value) ? value[innerPart] : value
  return !isTruthy(target)
}
