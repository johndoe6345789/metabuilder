/**
 * renderer-conditional.ts
 *
 * Condition and conditional-branch evaluation helpers.
 */
import type { UIComponent } from './types'
import { resolveDataBinding } from './utils'
import {
  evaluateConditionExpression,
} from './expression-helpers'
import type { RenderBranchFn } from './renderer-types'

export function evalCondition(
  component: UIComponent,
  dataMap: Record<string, unknown>,
  context: Record<string, unknown>
): boolean {
  if (!component.condition) return true
  const visible =
    typeof component.condition === 'string'
      ? evaluateConditionExpression(
          component.condition,
          { ...dataMap, ...context },
          { label: `condition (${component.id})` }
        )
      : resolveDataBinding(
          component.condition, dataMap, context
        )
  return Boolean(visible)
}

/** Returns the content node for a conditional block,
 *  or the sentinel `'continue'` if no branch matched
 *  and rendering should proceed normally. */
export function evalConditional(
  component: UIComponent,
  dataMap: Record<string, unknown>,
  context: Record<string, unknown>,
  renderBranch: RenderBranchFn
): React.ReactNode | 'continue' {
  if (!component.conditional) return 'continue'
  const met = evaluateConditionExpression(
    component.conditional.if,
    { ...dataMap, ...context },
    { label: `conditional (${component.id})` }
  )
  if (met) {
    if (component.conditional.then !== undefined) {
      return renderBranch(
        component.conditional.then as any, context
      )
    }
    return 'continue'
  }
  if (component.conditional.else !== undefined) {
    return renderBranch(
      component.conditional.else as any, context
    )
  }
  return null
}
