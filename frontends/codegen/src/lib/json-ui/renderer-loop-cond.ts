/**
 * resolveLoopCondition — guard condition for loop rendering.
 */
import { resolveDataBinding } from './utils'
import { evaluateConditionExpression } from
  './expression-helpers'

export function resolveLoopCondition(
  component: any,
  dataMap: Record<string, unknown>,
  context: Record<string, unknown>,
): boolean {
  if (!component.condition) return true
  if (typeof component.condition === 'string') {
    return evaluateConditionExpression(
      component.condition,
      { ...dataMap, ...context },
      { label: `loop condition (${component.id})` },
    )
  }
  return Boolean(
    resolveDataBinding(component.condition, dataMap, context),
  )
}
