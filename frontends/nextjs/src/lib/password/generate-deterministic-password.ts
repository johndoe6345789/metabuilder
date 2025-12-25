/**
 * Generate a deterministic password from a seed string using FNV-1a hash
 */
export function generateDeterministicScrambledPassword(seed: string, length: number = 16): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let hash = 0x811c9dc5

  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }

  let state = hash || 1
  let password = ''

  for (let i = 0; i < length; i++) {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    const rand = ((t ^ (t >>> 14)) >>> 0) / 4294967296
    password += charset[Math.floor(rand * charset.length)]
  }

  return password
}
