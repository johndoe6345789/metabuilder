const SCRAMBLE_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'

/**
 * Generate a deterministic scrambled password from a seed
 * Uses FNV-1a inspired hash for consistent output across server/client
 */
function generateDeterministicScrambledPassword(seed: string, length: number = 16): string {
  let hash = 2166136261
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i)
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)
  }

  let password = ''
  for (let i = 0; i < length; i++) {
    hash = (hash * 1664525 + 1013904223) >>> 0
    password += SCRAMBLE_CHARSET[hash % SCRAMBLE_CHARSET.length]
  }
  return password
}

/**
 * Pre-generated scrambled passwords for default user accounts
 */
export const SCRAMBLED_PASSWORDS = {
  supergod: generateDeterministicScrambledPassword('supergod', 16),
  god: generateDeterministicScrambledPassword('god', 16),
  admin: generateDeterministicScrambledPassword('admin', 16),
  demo: generateDeterministicScrambledPassword('demo', 16),
}
