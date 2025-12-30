export function evaluateConditional(
  condition: string | boolean,
  context: Record<string, unknown>
): boolean {
  if (typeof condition === 'boolean') return condition
  if (!condition) return true

  const value = context[condition]
  return Boolean(value)
}
