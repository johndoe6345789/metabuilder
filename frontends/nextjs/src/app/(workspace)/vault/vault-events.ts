export type VaultEvent = (...args: unknown[]) => unknown

export function resolveEvent(context: unknown, reference: string): VaultEvent {
  const resolved = reference.split('.').reduce<unknown>((value, key) => {
    if (typeof value !== 'object' || value === null) return undefined
    return (value as Record<string, unknown>)[key]
  }, context)
  if (typeof resolved !== 'function') {
    throw new Error(`Unknown declarative event: ${reference}`)
  }
  return resolved as VaultEvent
}
