export function createNodeId(prefix: string): string {
  const globalCrypto = globalThis.crypto
  if (globalCrypto && 'randomUUID' in globalCrypto) {
    return `${prefix}-${globalCrypto.randomUUID()}`
  }

  const fallback = Math.random().toString(16).slice(2)
  return `${prefix}-${Date.now()}-${fallback}`
}
