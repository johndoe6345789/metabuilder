import type { JsonValue } from '@/types/utility-types'

export function evaluateConditional(
  condition: string | boolean,
  context: Record<string, JsonValue>
): boolean {
  if (typeof condition === 'boolean') return condition
  if (!condition) return true

  const value = context[condition]
  return Boolean(value)
}
